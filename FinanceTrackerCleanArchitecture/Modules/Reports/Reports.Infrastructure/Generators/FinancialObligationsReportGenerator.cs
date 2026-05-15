using System.Text.Json;
using ClosedXML.Excel;
using Finance.Domain.Entities;
using Finance.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Reports.Domain.Enums;
using Reports.Domain.Interfaces;
using Users.Domain.Interfaces;

namespace Reports.Infrastructure.Generators;

public class FinancialObligationsReportGenerator : IReportGenerator
{
  private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

  private readonly IProfileRepository _profileRepository;
  private readonly ICreditRepository _creditRepository;
  private readonly IDebtRepository _debtRepository;
  private readonly IDepositRepository _depositRepository;
  private readonly ILogger<FinancialObligationsReportGenerator> _logger;

  public FinancialObligationsReportGenerator(
    IProfileRepository profileRepository,
    ICreditRepository creditRepository,
    IDebtRepository debtRepository,
    IDepositRepository depositRepository,
    ILogger<FinancialObligationsReportGenerator> logger)
  {
    _profileRepository = profileRepository;
    _creditRepository = creditRepository;
    _debtRepository = debtRepository;
    _depositRepository = depositRepository;
    _logger = logger;
  }

  public ReportType Type => ReportType.FinancialObligations;

  public async Task<Stream> GenerateAsync(ReportContext context, CancellationToken ct = default)
  {
    var parameters = ParseParameters(context.ParametersJson);

    var profile = await _profileRepository.GetByIdProfileAsync(parameters.ProfileId)
      ?? throw new ReportGenerationException($"Profile {parameters.ProfileId} not found.");

    var credits = (await _creditRepository.GetByProfileIdAsync(parameters.ProfileId)).ToList();
    var debts = (await _debtRepository.GetByProfileIdAsync(parameters.ProfileId)).ToList();
    var deposits = (await _depositRepository.GetByProfileIdAsync(parameters.ProfileId)).ToList();

    if (parameters.From.HasValue)
    {
      credits = credits.Where(c => c.EndDate >= parameters.From.Value).ToList();
      deposits = deposits.Where(d => d.EndDate >= parameters.From.Value).ToList();
      debts = debts.Where(d => !d.DueDate.HasValue || d.DueDate.Value >= parameters.From.Value).ToList();
    }
    if (parameters.To.HasValue)
    {
      credits = credits.Where(c => c.StartDate <= parameters.To.Value).ToList();
      deposits = deposits.Where(d => d.StartDate <= parameters.To.Value).ToList();
      debts = debts.Where(d => !d.DueDate.HasValue || d.DueDate.Value <= parameters.To.Value).ToList();
    }

    _logger.LogInformation(
      "Financial obligations report: profile={ProfileId}, credits={Credits}, debts={Debts}, deposits={Deposits}",
      parameters.ProfileId, credits.Count, debts.Count, deposits.Count);

    return BuildExcel(profile.Name, parameters, credits, debts, deposits);
  }

  private static FinancialObligationsParameters ParseParameters(string json)
  {
    try
    {
      var parameters = JsonSerializer.Deserialize<FinancialObligationsParameters>(json, JsonOptions)
        ?? throw new ReportGenerationException("Parameters JSON deserialized to null.");

      if (parameters.ProfileId == Guid.Empty)
        throw new ReportGenerationException("ProfileId is required in parameters.");

      return parameters;
    }
    catch (JsonException ex)
    {
      throw new ReportGenerationException("Failed to parse report parameters JSON.", ex);
    }
  }

  private static Stream BuildExcel(
    string profileName,
    FinancialObligationsParameters parameters,
    List<Credit> credits,
    List<Debt> debts,
    List<Deposit> deposits)
  {
    var workbook = new XLWorkbook();
    BuildCreditsSheet(workbook, profileName, parameters, credits);
    BuildDebtsSheet(workbook, profileName, parameters, debts);
    BuildDepositsSheet(workbook, profileName, parameters, deposits);

    var stream = new MemoryStream();
    workbook.SaveAs(stream);
    stream.Position = 0;
    return stream;
  }

  private static void BuildCreditsSheet(XLWorkbook workbook, string profileName, FinancialObligationsParameters parameters, List<Credit> credits)
  {
    var sheet = workbook.Worksheets.Add("Кредиты");

    sheet.Cell("A1").Value = "Кредиты";
    sheet.Range("A1:I1").Merge().Style.Font.SetBold().Font.SetFontSize(14);
    sheet.Cell("A2").Value = $"Профиль: {profileName}";
    var period = parameters.From.HasValue && parameters.To.HasValue
      ? $"Период: {parameters.From:yyyy-MM-dd} — {parameters.To:yyyy-MM-dd}"
      : $"Дата формирования: {DateTime.UtcNow:yyyy-MM-dd}";
    sheet.Cell("A3").Value = period;

    const int headerRow = 5;
    sheet.Cell(headerRow, 1).Value = "Название";
    sheet.Cell(headerRow, 2).Value = "Валюта";
    sheet.Cell(headerRow, 3).Value = "Сумма кредита";
    sheet.Cell(headerRow, 4).Value = "Остаток";
    sheet.Cell(headerRow, 5).Value = "Платёж/мес.";
    sheet.Cell(headerRow, 6).Value = "Ставка %";
    sheet.Cell(headerRow, 7).Value = "Дата начала";
    sheet.Cell(headerRow, 8).Value = "Дата окончания";
    sheet.Cell(headerRow, 9).Value = "Статус";

    var headerRange = sheet.Range(headerRow, 1, headerRow, 9);
    headerRange.Style.Font.Bold = true;
    headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
    headerRange.Style.Border.BottomBorder = XLBorderStyleValues.Thin;

    var currentRow = headerRow + 1;
    foreach (var credit in credits.OrderBy(c => c.IsClosed).ThenBy(c => c.EndDate))
    {
      sheet.Cell(currentRow, 1).Value = credit.Name;
      sheet.Cell(currentRow, 2).Value = credit.Currency?.Code ?? "—";
      sheet.Cell(currentRow, 3).Value = credit.TotalAmount;
      sheet.Cell(currentRow, 3).Style.NumberFormat.Format = "#,##0.00";
      sheet.Cell(currentRow, 4).Value = credit.RemainingAmount;
      sheet.Cell(currentRow, 4).Style.NumberFormat.Format = "#,##0.00";
      sheet.Cell(currentRow, 5).Value = credit.MonthlyPayment;
      sheet.Cell(currentRow, 5).Style.NumberFormat.Format = "#,##0.00";
      sheet.Cell(currentRow, 6).Value = credit.InterestRate;
      sheet.Cell(currentRow, 6).Style.NumberFormat.Format = "0.00";
      sheet.Cell(currentRow, 7).Value = credit.StartDate.ToDateTime(TimeOnly.MinValue);
      sheet.Cell(currentRow, 7).Style.DateFormat.Format = "yyyy-MM-dd";
      sheet.Cell(currentRow, 8).Value = credit.EndDate.ToDateTime(TimeOnly.MinValue);
      sheet.Cell(currentRow, 8).Style.DateFormat.Format = "yyyy-MM-dd";
      sheet.Cell(currentRow, 9).Value = credit.IsClosed ? "Закрыт" : "Активен";
      if (credit.IsClosed)
        sheet.Row(currentRow).Style.Font.FontColor = XLColor.Gray;
      currentRow++;
    }

    var activeCredits = credits.Where(c => !c.IsClosed).ToList();
    if (activeCredits.Count > 0)
    {
      var summaryRow = currentRow + 1;
      sheet.Cell(summaryRow, 3).Value = "Итого остаток:";
      sheet.Cell(summaryRow, 3).Style.Font.Bold = true;
      sheet.Cell(summaryRow, 4).Value = activeCredits.Sum(c => c.RemainingAmount);
      sheet.Cell(summaryRow, 4).Style.NumberFormat.Format = "#,##0.00";
      sheet.Cell(summaryRow, 4).Style.Font.Bold = true;
    }

    sheet.Columns().AdjustToContents();
  }

  private static void BuildDebtsSheet(XLWorkbook workbook, string profileName, FinancialObligationsParameters parameters, List<Debt> debts)
  {
    var sheet = workbook.Worksheets.Add("Долги");

    sheet.Cell("A1").Value = "Долги";
    sheet.Range("A1:F1").Merge().Style.Font.SetBold().Font.SetFontSize(14);
    sheet.Cell("A2").Value = $"Профиль: {profileName}";
    var period = parameters.From.HasValue && parameters.To.HasValue
      ? $"Период: {parameters.From:yyyy-MM-dd} — {parameters.To:yyyy-MM-dd}"
      : $"Дата формирования: {DateTime.UtcNow:yyyy-MM-dd}";
    sheet.Cell("A3").Value = period;

    const int headerRow = 5;
    sheet.Cell(headerRow, 1).Value = "Кредитор";
    sheet.Cell(headerRow, 2).Value = "Валюта";
    sheet.Cell(headerRow, 3).Value = "Сумма долга";
    sheet.Cell(headerRow, 4).Value = "Остаток";
    sheet.Cell(headerRow, 5).Value = "Срок погашения";
    sheet.Cell(headerRow, 6).Value = "Статус";

    var headerRange = sheet.Range(headerRow, 1, headerRow, 6);
    headerRange.Style.Font.Bold = true;
    headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
    headerRange.Style.Border.BottomBorder = XLBorderStyleValues.Thin;

    var currentRow = headerRow + 1;
    foreach (var debt in debts.OrderBy(d => d.IsRepaid).ThenBy(d => d.DueDate))
    {
      sheet.Cell(currentRow, 1).Value = debt.CreditorName;
      sheet.Cell(currentRow, 2).Value = debt.Currency?.Code ?? "—";
      sheet.Cell(currentRow, 3).Value = debt.TotalAmount;
      sheet.Cell(currentRow, 3).Style.NumberFormat.Format = "#,##0.00";
      sheet.Cell(currentRow, 4).Value = debt.RemainingAmount;
      sheet.Cell(currentRow, 4).Style.NumberFormat.Format = "#,##0.00";
      if (debt.DueDate.HasValue)
      {
        sheet.Cell(currentRow, 5).Value = debt.DueDate.Value.ToDateTime(TimeOnly.MinValue);
        sheet.Cell(currentRow, 5).Style.DateFormat.Format = "yyyy-MM-dd";
      }
      else
      {
        sheet.Cell(currentRow, 5).Value = "—";
      }
      sheet.Cell(currentRow, 6).Value = debt.IsRepaid ? "Погашен" : "Активен";
      if (debt.IsRepaid)
        sheet.Row(currentRow).Style.Font.FontColor = XLColor.Gray;
      currentRow++;
    }

    var activeDebts = debts.Where(d => !d.IsRepaid).ToList();
    if (activeDebts.Count > 0)
    {
      var summaryRow = currentRow + 1;
      sheet.Cell(summaryRow, 3).Value = "Итого остаток:";
      sheet.Cell(summaryRow, 3).Style.Font.Bold = true;
      sheet.Cell(summaryRow, 4).Value = activeDebts.Sum(d => d.RemainingAmount);
      sheet.Cell(summaryRow, 4).Style.NumberFormat.Format = "#,##0.00";
      sheet.Cell(summaryRow, 4).Style.Font.Bold = true;
    }

    sheet.Columns().AdjustToContents();
  }

  private static void BuildDepositsSheet(XLWorkbook workbook, string profileName, FinancialObligationsParameters parameters, List<Deposit> deposits)
  {
    var sheet = workbook.Worksheets.Add("Депозиты");

    sheet.Cell("A1").Value = "Депозиты";
    sheet.Range("A1:I1").Merge().Style.Font.SetBold().Font.SetFontSize(14);
    sheet.Cell("A2").Value = $"Профиль: {profileName}";
    var period = parameters.From.HasValue && parameters.To.HasValue
      ? $"Период: {parameters.From:yyyy-MM-dd} — {parameters.To:yyyy-MM-dd}"
      : $"Дата формирования: {DateTime.UtcNow:yyyy-MM-dd}";
    sheet.Cell("A3").Value = period;

    const int headerRow = 5;
    sheet.Cell(headerRow, 1).Value = "Название";
    sheet.Cell(headerRow, 2).Value = "Валюта";
    sheet.Cell(headerRow, 3).Value = "Начальная сумма";
    sheet.Cell(headerRow, 4).Value = "Текущая сумма";
    sheet.Cell(headerRow, 5).Value = "Ставка %";
    sheet.Cell(headerRow, 6).Value = "Дата начала";
    sheet.Cell(headerRow, 7).Value = "Дата окончания";
    sheet.Cell(headerRow, 8).Value = "Капитализация";
    sheet.Cell(headerRow, 9).Value = "Статус";

    var headerRange = sheet.Range(headerRow, 1, headerRow, 9);
    headerRange.Style.Font.Bold = true;
    headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
    headerRange.Style.Border.BottomBorder = XLBorderStyleValues.Thin;

    var currentRow = headerRow + 1;
    foreach (var deposit in deposits.OrderBy(d => d.IsClosed).ThenBy(d => d.EndDate))
    {
      sheet.Cell(currentRow, 1).Value = deposit.Name;
      sheet.Cell(currentRow, 2).Value = deposit.Currency?.Code ?? "—";
      sheet.Cell(currentRow, 3).Value = deposit.InitialAmount;
      sheet.Cell(currentRow, 3).Style.NumberFormat.Format = "#,##0.00";
      sheet.Cell(currentRow, 4).Value = deposit.CurrentAmount;
      sheet.Cell(currentRow, 4).Style.NumberFormat.Format = "#,##0.00";
      sheet.Cell(currentRow, 5).Value = deposit.InterestRate;
      sheet.Cell(currentRow, 5).Style.NumberFormat.Format = "0.00";
      sheet.Cell(currentRow, 6).Value = deposit.StartDate.ToDateTime(TimeOnly.MinValue);
      sheet.Cell(currentRow, 6).Style.DateFormat.Format = "yyyy-MM-dd";
      sheet.Cell(currentRow, 7).Value = deposit.EndDate.ToDateTime(TimeOnly.MinValue);
      sheet.Cell(currentRow, 7).Style.DateFormat.Format = "yyyy-MM-dd";
      sheet.Cell(currentRow, 8).Value = deposit.IsCapitalized ? "Да" : "Нет";
      sheet.Cell(currentRow, 9).Value = deposit.IsClosed ? "Закрыт" : "Активен";
      if (deposit.IsClosed)
        sheet.Row(currentRow).Style.Font.FontColor = XLColor.Gray;
      currentRow++;
    }

    var activeDeposits = deposits.Where(d => !d.IsClosed).ToList();
    if (activeDeposits.Count > 0)
    {
      var summaryRow = currentRow + 1;
      sheet.Cell(summaryRow, 3).Value = "Итого текущая сумма:";
      sheet.Cell(summaryRow, 3).Style.Font.Bold = true;
      sheet.Cell(summaryRow, 4).Value = activeDeposits.Sum(d => d.CurrentAmount);
      sheet.Cell(summaryRow, 4).Style.NumberFormat.Format = "#,##0.00";
      sheet.Cell(summaryRow, 4).Style.Font.Bold = true;
    }

    sheet.Columns().AdjustToContents();
  }
}
