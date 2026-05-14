namespace Core.API.Contracts.Reports;

public record CreateCategoryBreakdownReportRequest(
  Guid ProfileId,
  DateOnly From,
  DateOnly To);
