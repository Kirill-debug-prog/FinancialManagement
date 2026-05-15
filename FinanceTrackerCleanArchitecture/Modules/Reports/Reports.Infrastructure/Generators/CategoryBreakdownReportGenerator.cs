using System.Text.Json;
using ClosedXML.Excel;
using Finance.Domain.Enums;
using Finance.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Reports.Domain.Enums;
using Reports.Domain.Interfaces;
using Reports.Infrastructure.Charts;
using Users.Domain.Interfaces;

namespace Reports.Infrastructure.Generators;

public class CategoryBreakdownReportGenerator : IReportGenerator
{
  private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

  private static readonly string[] PieColors =
  [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6",
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f59e0b",
    "#10b981", "#6366f1"
  ];

  private readonly IProfileRepository _profileRepository;
  private readonly IWalletRepository _walletRepository;
  private readonly ITransactionRepository _transactionRepository;
  private readonly ICategoryRepository _categoryRepository;
  private readonly IChartServiceClient _chartClient;
  private readonly ILogger<CategoryBreakdownReportGenerator> _logger;

  public CategoryBreakdownReportGenerator(
    IProfileRepository profileRepository,
    IWalletRepository walletRepository,
    ITransactionRepository transactionRepository,
    ICategoryRepository categoryRepository,
    IChartServiceClient chartClient,
    ILogger<CategoryBreakdownReportGenerator> logger)
  {
    _profileRepository = profileRepository;
    _walletRepository = walletRepository;
    _transactionRepository = transactionRepository;
    _categoryRepository = categoryRepository;
    _chartClient = chartClient;
    _logger = logger;
  }

  public ReportType Type => ReportType.CategoryBreakdown;

  public async Task<Stream> GenerateAsync(ReportContext context, CancellationToken ct = default)
  {
    var parameters = ParseParameters(context.ParametersJson);

    var profile = await _profileRepository.GetByIdProfileAsync(parameters.ProfileId)
      ?? throw new ReportGenerationException($"Profile {parameters.ProfileId} not found.");

    var wallets = (await _walletRepository.GetWalletsByProfileIdAsync(parameters.ProfileId)).ToList();

    var allCategories = (await _categoryRepository.GetSystemCategoriesAsync())
      .Concat(await _categoryRepository.GetByProfileIdAsync(parameters.ProfileId))
      .ToDictionary(c => c.Id, c => c.Name);

    var incomeRows = new List<(string Category, decimal Amount)>();
    var expenseRows = new List<(string Category, decimal Amount)>();

    foreach (var wallet in wallets)
    {
      ct.ThrowIfCancellationRequested();
      var transactions = await _transactionRepository.GetByWalletIdAsync(wallet.Id);
      foreach (var t in transactions.Where(t => t.Date >= parameters.From && t.Date <= parameters.To))
      {
        var catName = t.CategoryId.HasValue && allCategories.TryGetValue(t.CategoryId.Value, out var cat)
          ? cat
          : "Без категории";

        if (t.Type == FinancialType.Income)
          incomeRows.Add((catName, t.Amount));
        else if (t.Type == FinancialType.Expense)
          expenseRows.Add((catName, t.Amount));
      }
    }

    _logger.LogInformation(
      "Category breakdown report: profile={ProfileId}, income rows={Income}, expense rows={Expense}",
      parameters.ProfileId, incomeRows.Count, expenseRows.Count);

    // Build category aggregates for pie charts
    var expGroups = expenseRows
      .GroupBy(r => r.Category)
      .OrderByDescending(g => g.Sum(r => r.Amount))
      .Select((g, i) => new CategoryPieItem(g.Key, g.Sum(r => r.Amount), PieColors[i % PieColors.Length]))
      .ToList();

    var incGroups = incomeRows
      .GroupBy(r => r.Category)
      .OrderByDescending(g => g.Sum(r => r.Amount))
      .Select((g, i) => new CategoryPieItem(g.Key, g.Sum(r => r.Amount), PieColors[i % PieColors.Length]))
      .ToList();

    byte[]? expPie = null;
    byte[]? incPie = null;

    if (expGroups.Count > 0)
      expPie = await _chartClient.GetCategoryPieAsync(new(expGroups, "Структура расходов"), ct);
    if (incGroups.Count > 0)
      incPie = await _chartClient.GetCategoryPieAsync(new(incGroups, "Структура доходов"), ct);

    return BuildExcel(profile.Name, parameters, incomeRows, expenseRows, incPie, expPie);
  }

  private static CategoryBreakdownParameters ParseParameters(string json)
  {
    try
    {
      var parameters = JsonSerializer.Deserialize<CategoryBreakdownParameters>(json, JsonOptions)
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

  private static Stream BuildExcel(
    string profileName,
    CategoryBreakdownParameters parameters,
    List<(string Category, decimal Amount)> incomeRows,
    List<(string Category, decimal Amount)> expenseRows,
    byte[]? incomePie,
    byte[]? expensePie)
  {
    var workbook = new XLWorkbook();
    AddSheet(workbook, "Доходы", profileName, parameters, incomeRows);
    AddSheet(workbook, "Расходы", profileName, parameters, expenseRows);

    if (incomePie is not null || expensePie is not null)
    {
      var charts = workbook.Worksheets.Add("Графики");
      charts.Cell("A1").Value = "Структура доходов и расходов";
      charts.Range("A1:R1").Merge().Style.Font.SetBold().Font.SetFontSize(14);

      var col = 1;
      if (incomePie is not null)
      {
        using var s = new MemoryStream(incomePie);
        charts.AddPicture(s).MoveTo(charts.Cell(3, col)).WithSize(700, 520);
        col += 10;
      }
      if (expensePie is not null)
      {
        using var s = new MemoryStream(expensePie);
        charts.AddPicture(s).MoveTo(charts.Cell(3, col)).WithSize(700, 520);
      }
    }

    var stream = new MemoryStream();
    workbook.SaveAs(stream);
    stream.Position = 0;
    return stream;
  }

  private static void AddSheet(
    XLWorkbook workbook,
    string sheetTitle,
    string profileName,
    CategoryBreakdownParameters parameters,
    List<(string Category, decimal Amount)> rows)
  {
    var sheet = workbook.Worksheets.Add(sheetTitle);

    sheet.Cell("A1").Value = $"{sheetTitle} по категориям";
    sheet.Range("A1:D1").Merge().Style.Font.SetBold().Font.SetFontSize(14);
    sheet.Cell("A2").Value = $"Профиль: {profileName}";
    sheet.Cell("A3").Value = $"Период: {parameters.From:yyyy-MM-dd} — {parameters.To:yyyy-MM-dd}";

    const int headerRow = 5;
    sheet.Cell(headerRow, 1).Value = "Категория";
    sheet.Cell(headerRow, 2).Value = "Количество";
    sheet.Cell(headerRow, 3).Value = "Сумма";
    sheet.Cell(headerRow, 4).Value = "% от итога";

    var headerRange = sheet.Range(headerRow, 1, headerRow, 4);
    headerRange.Style.Font.Bold = true;
    headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
    headerRange.Style.Border.BottomBorder = XLBorderStyleValues.Thin;

    var grouped = rows
      .GroupBy(r => r.Category)
      .Select(g => (Category: g.Key, Count: g.Count(), Total: g.Sum(r => r.Amount)))
      .OrderByDescending(g => g.Total)
      .ToList();

    var totalAmount = grouped.Sum(g => g.Total);

    var currentRow = headerRow + 1;
    foreach (var (category, count, total) in grouped)
    {
      sheet.Cell(currentRow, 1).Value = category;
      sheet.Cell(currentRow, 2).Value = count;
      sheet.Cell(currentRow, 3).Value = total;
      sheet.Cell(currentRow, 3).Style.NumberFormat.Format = "#,##0.00";
      sheet.Cell(currentRow, 4).Value = totalAmount > 0 ? Math.Round(total / totalAmount * 100, 2) : 0m;
      sheet.Cell(currentRow, 4).Style.NumberFormat.Format = "0.00";
      currentRow++;
    }

    var summaryRow = currentRow + 1;
    sheet.Cell(summaryRow, 2).Value = "Итого:";
    sheet.Cell(summaryRow, 2).Style.Font.Bold = true;
    sheet.Cell(summaryRow, 3).Value = totalAmount;
    sheet.Cell(summaryRow, 3).Style.NumberFormat.Format = "#,##0.00";
    sheet.Cell(summaryRow, 3).Style.Font.Bold = true;

    sheet.Columns().AdjustToContents();
  }
}
