namespace Reports.Domain.Interfaces;

public interface IReportPipeline
{
  Task ProcessAsync(Guid jobId, CancellationToken cancellationToken = default);
}