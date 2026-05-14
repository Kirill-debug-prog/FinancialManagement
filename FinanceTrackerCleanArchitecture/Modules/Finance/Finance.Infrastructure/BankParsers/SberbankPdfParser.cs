using System.Globalization;
using System.Text.RegularExpressions;
using Finance.Application.Import;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;

namespace Finance.Infrastructure.BankParsers;

public class SberbankPdfParser : IBankStatementParser
{
  // DD.MM.YYYY HH:MM at start of transaction header line
  private static readonly Regex HeaderStartRegex = new(
    @"^(\d{2}\.\d{2}\.\d{4})\s+(\d{2}:\d{2})\s+",
    RegexOptions.Compiled);

  // DD.MM.YYYY 6DIGITS at start of description line
  private static readonly Regex DescriptionStartRegex = new(
    @"^(\d{2}\.\d{2}\.\d{4})\s+(\d{6})\s+(.+)$",
    RegexOptions.Compiled);

  // Two trailing Russian-format numbers at end of header line: amount + balance
  // Russian format: space as thousands separator, comma as decimal
  private static readonly Regex TrailingAmountsRegex = new(
    @"(\+?\d{1,3}(?: \d{3})*,\d{2})\s+(\d{1,3}(?: \d{3})*,\d{2})\s*$",
    RegexOptions.Compiled);

  public IEnumerable<ParsedTransaction> Parse(byte[] pdfBytes)
  {
    var lines = ExtractLines(pdfBytes);
    return ParseTransactions(lines);
  }

  private static List<string> ExtractLines(byte[] pdfBytes)
  {
    var result = new List<string>();

    using var pdf = PdfDocument.Open(pdfBytes);

    foreach (var page in pdf.GetPages())
    {
      var words = page.GetWords()
        .OrderByDescending(w => w.BoundingBox.Bottom)
        .ThenBy(w => w.BoundingBox.Left)
        .ToList();

      if (words.Count == 0) continue;

      const double lineThreshold = 3.0;
      var currentLineWords = new List<Word>();
      double? currentY = null;

      foreach (var word in words)
      {
        double y = word.BoundingBox.Bottom;
        if (currentY is null || Math.Abs(y - currentY.Value) > lineThreshold)
        {
          if (currentLineWords.Count > 0)
            result.Add(BuildLine(currentLineWords));

          currentLineWords = [word];
          currentY = y;
        }
        else
        {
          currentLineWords.Add(word);
        }
      }

      if (currentLineWords.Count > 0)
        result.Add(BuildLine(currentLineWords));
    }

    return result;
  }

  private static string BuildLine(List<Word> words)
  {
    var text = string.Join(" ", words.Select(w => w.Text));
    // Normalize "+" detached from digit when PDF stores them as separate glyphs
    return Regex.Replace(text, @"\+\s+(\d)", "+$1");
  }

  private static IEnumerable<ParsedTransaction> ParseTransactions(List<string> lines)
  {
    TransactionBuilder? current = null;

    foreach (var line in lines)
    {
      if (TryParseHeader(line, out var builder))
      {
        if (current != null)
          yield return current.Build();

        current = builder;
      }
      else if (current != null && TryParseDescription(line, out var desc))
      {
        current.Description = desc;
      }
      // Non-matching lines are page headers, footers, or description continuations — ignored
    }

    if (current != null)
      yield return current.Build();
  }

  private static bool TryParseHeader(string line, out TransactionBuilder? result)
  {
    result = null;

    var headerMatch = HeaderStartRegex.Match(line);
    if (!headerMatch.Success) return false;

    var trailingMatch = TrailingAmountsRegex.Match(line);
    if (!trailingMatch.Success) return false;

    int categoryStart = headerMatch.Length;
    int categoryEnd = trailingMatch.Index;
    if (categoryEnd <= categoryStart) return false;

    var dateStr = headerMatch.Groups[1].Value;
    if (!DateOnly.TryParseExact(dateStr, "dd.MM.yyyy", CultureInfo.InvariantCulture,
          DateTimeStyles.None, out var date))
      return false;

    var category = line[categoryStart..categoryEnd].Trim();
    var amountStr = trailingMatch.Groups[1].Value;
    var isIncome = amountStr.StartsWith('+');
    var amount = ParseAmount(amountStr);

    if (amount <= 0) return false;

    result = new TransactionBuilder
    {
      Date = date,
      Category = category,
      Amount = amount,
      IsIncome = isIncome
    };

    return true;
  }

  private static bool TryParseDescription(string line, out string? description)
  {
    description = null;
    var match = DescriptionStartRegex.Match(line);
    if (!match.Success) return false;

    var raw = match.Groups[3].Value;
    // Strip trailing ". Операция по карте ****XXXX"
    var opIdx = raw.LastIndexOf(". Операция", StringComparison.OrdinalIgnoreCase);
    description = (opIdx > 0 ? raw[..opIdx] : raw).Trim();
    return true;
  }

  private static decimal ParseAmount(string amountStr)
  {
    var cleaned = amountStr.TrimStart('+').Replace(" ", "").Replace(",", ".");
    return decimal.Parse(cleaned, CultureInfo.InvariantCulture);
  }

  private sealed class TransactionBuilder
  {
    public DateOnly Date { get; set; }
    public string Category { get; set; } = "";
    public decimal Amount { get; set; }
    public bool IsIncome { get; set; }
    public string? Description { get; set; }

    public ParsedTransaction Build()
    {
      var desc = string.IsNullOrWhiteSpace(Description) || Description == Category
        ? Category
        : $"{Category}: {Description}";

      return new ParsedTransaction(Date, desc, Amount, IsIncome);
    }
  }
}
