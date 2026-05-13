using Reports.Domain.Enums;

namespace Reports.Domain.Interfaces;

public record ReportContext(
  Guid JobId,
  ReportType Type,
  Guid RequestedBy,
  string ParametersJson);

public interface IReportGenerator
{
  ReportType Type { get; }

  Task<Stream> GenerateAsync(
    ReportContext context,
    CancellationToken ct = default);
}