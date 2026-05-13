using System.Text.Json;
using ClosedXML.Excel;
using Finance.Domain.Enums;
using Finance.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Reports.Domain.Enums;
using Reports.Domain.Interfaces;
using Users.Domain.Interfaces;

namespace Reports.Infrastructure.Generators;

public class ProfileTransactionsReportGenerator : IReportGenerator
{
  private static readonly JsonSerializerOptions JsonOptions = new()
  {
    PropertyNameCaseInsensitive = true
  };

  private readonly IProfileRepository _profileRepository;
  private readonly IWalletRepository _walletRepository;
  private readonly ITransactionRepository _transactionRepository;
  private readonly ICategoryRepository _categoryRepository;
  private readonly ILogger<ProfileTransactionsReportGenerator> _logger;

  public ProfileTransactionsReportGenerator(
    IProfileRepository profileRepository,
    IWalletRepository walletRepository,
    ITransactionRepository transactionRepository,
    ICategoryRepository categoryRepository,
    ILogger<ProfileTransactionsReportGenerator> logger)
  {
    _profileRepository = profileRepository;
    _walletRepository = walletRepository;
    _transactionRepository = transactionRepository;
    _categoryRepository = categoryRepository;
    _logger = logger;
  }

  public ReportType Type => ReportType.ProfileTransactions;

  public async Task<Stream> GenerateAsync(ReportContext context, CancellationToken cancellationToken = default)
  {
    var parameters = ParseParameters(context.ParametersJson);

    var profile = await _profileRepository.GetByIdProfileAsync(parameters.ProfileId)
      ?? throw new ReportGenerationException($"Profile {parameters.ProfileId} not found.");

    var wallets = (await _walletRepository.GetWalletsByProfileIdAsync(parameters.ProfileId)).ToList();

    var allCategories = (await _categoryRepository.GetSystemCategoriesAsync())
      .Concat(await _categoryRepository.GetByProfileIdAsync(parameters.ProfileId))
      .ToDictionary(c => c.Id, c => c.Name);

    var transactions = new List<TransactionRow>();
    foreach (var wallet in wallets)
    {
      cancellationToken.ThrowIfCancellationRequested();
      var walletTransactions = await _transactionRepository.GetByWalletIdAsync(wallet.Id);
      foreach (var t in walletTransactions.Where(t => t.Date >= parameters.From && t.Date <= parameters.To))
      {
        transactions.Add(new TransactionRow
        {
          Date = t.Date,
          WalletName = wallet.Name,
          Type = t.Type,
          CategoryName = t.CategoryId.HasValue && allCategories.TryGetValue(t.CategoryId.Value, out var cat) ? cat : "—",
          Amount = t.Amount,
          Description = t.Description ?? string.Empty
        });
      }
    }

    transactions = transactions.OrderBy(r => r.Date).ToList();

    _logger.LogInformation(
      "Profile transactions report: profile={ProfileId}, rows={Count}",
      parameters.ProfileId, transactions.Count);

    return BuildExcel(profile.Name, parameters, transactions);
  }

  private static ProfileTransactionsParameters ParseParameters(string json)
  {
    try
    {
      var parameters = JsonSerializer.Deserialize<ProfileTransactionsParameters>(json, JsonOptions)
        ?? throw new ReportGenerationException("Parameters JSON deserialized to null.");

      if (parameters.ProfileId == Guid.Empty)
        throw new ReportGenerationException("ProfileId is required in parameters.");

      if (parameters.From > parameters.To)
        throw new ReportGenerationException("'From' date must be before or equal to 'To' date.");

      return parameters;
    }
    catch (JsonException ex)
    {
      throw new ReportGenerationException("Failed to parse report parameters JSON.", ex);
    }
  }

  private static Stream BuildExcel(string profileName, ProfileTransactionsParameters parameters, List<TransactionRow> rows)
  {
    var workbook = new XLWorkbook();
    var sheet = workbook.Worksheets.Add("Transactions");

    sheet.Cell("A1").Value = "Отчёт по транзакциям профиля";
    sheet.Range("A1:F1").Merge().Style.Font.SetBold().Font.SetFontSize(14);

    sheet.Cell("A2").Value = $"Профиль: {profileName}";
    sheet.Cell("A3").Value = $"Период: {parameters.From:yyyy-MM-dd} — {parameters.To:yyyy-MM-dd}";
    sheet.Cell("A4").Value = $"Записей: {rows.Count}";

    const int headerRow = 6;
    sheet.Cell(headerRow, 1).Value = "Дата";
    sheet.Cell(headerRow, 2).Value = "Кошелёк";
    sheet.Cell(headerRow, 3).Value = "Тип";
    sheet.Cell(headerRow, 4).Value = "Категория";
    sheet.Cell(headerRow, 5).Value = "Сумма";
    sheet.Cell(headerRow, 6).Value = "Описание";

    var headerRange = sheet.Range(headerRow, 1, headerRow, 6);
    headerRange.Style.Font.Bold = true;
    headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
    headerRange.Style.Border.BottomBorder = XLBorderStyleValues.Thin;

    var currentRow = headerRow + 1;
    foreach (var row in rows)
    {
      sheet.Cell(currentRow, 1).Value = row.Date.ToDateTime(TimeOnly.MinValue);
      sheet.Cell(currentRow, 1).Style.DateFormat.Format = "yyyy-MM-dd";
      sheet.Cell(currentRow, 2).Value = row.WalletName;
      sheet.Cell(currentRow, 3).Value = TypeToText(row.Type);
      sheet.Cell(currentRow, 4).Value = row.CategoryName;
      sheet.Cell(currentRow, 5).Value = row.Amount;
      sheet.Cell(currentRow, 5).Style.NumberFormat.Format = "#,##0.00";
      sheet.Cell(currentRow, 6).Value = row.Description;
      currentRow++;
    }

    var totalIncome = rows.Where(r => r.Type == FinancialType.Income).Sum(r => r.Amount);
    var totalExpense = rows.Where(r => r.Type == FinancialType.Expense).Sum(r => r.Amount);

    var summaryRow = currentRow + 1;
    sheet.Cell(summaryRow, 4).Value = "Итого доходов:";
    sheet.Cell(summaryRow, 5).Value = totalIncome;
    sheet.Cell(summaryRow, 5).Style.NumberFormat.Format = "#,##0.00";
    sheet.Cell(summaryRow + 1, 4).Value = "Итого расходов:";
    sheet.Cell(summaryRow + 1, 5).Value = totalExpense;
    sheet.Cell(summaryRow + 1, 5).Style.NumberFormat.Format = "#,##0.00";
    sheet.Range(summaryRow, 4, summaryRow + 1, 5).Style.Font.Bold = true;

    sheet.Columns().AdjustToContents();

    var stream = new MemoryStream();
    workbook.SaveAs(stream);
    stream.Position = 0;
    return stream;
  }

  private static string TypeToText(FinancialType type) => type switch
  {
    FinancialType.Income => "Доход",
    FinancialType.Expense => "Расход",
    FinancialType.Transfer => "Перевод",
    _ => type.ToString()
  };

  private class TransactionRow
  {
    public DateOnly Date { get; set; }
    public string WalletName { get; set; } = string.Empty;
    public FinancialType Type { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
  }
}