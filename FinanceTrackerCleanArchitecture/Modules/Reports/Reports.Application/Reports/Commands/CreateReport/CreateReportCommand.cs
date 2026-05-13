using Reports.Domain.Enums;

namespace Reports.Application.Reports.Commands.CreateReport;

public record CreateReportCommand(
  ReportType Type,
  Guid RequestedBy,
  string ParametersJson);