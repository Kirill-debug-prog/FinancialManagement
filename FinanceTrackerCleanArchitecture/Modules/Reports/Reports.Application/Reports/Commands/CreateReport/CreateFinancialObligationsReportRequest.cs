namespace Reports.Application.Reports.Commands.CreateReport;

public record CreateFinancialObligationsReportRequest(
  Guid ProfileId,
  DateOnly? From,
  DateOnly? To);
