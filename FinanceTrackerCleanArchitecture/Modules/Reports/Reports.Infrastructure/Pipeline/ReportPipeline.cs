using System.Diagnostics;
using Microsoft.Extensions.Logging;
using Reports.Domain.Interfaces;
using Reports.Infrastructure.Storage;

namespace Reports.Infrastructure.Pipeline;

public class ReportPipeline : IReportPipeline
{
  private readonly IReportJobRepository _jobRepository;
  private readonly IEnumerable<IReportGenerator> _generators;
  private readonly IFileStorage _fileStorage;
  private readonly ILogger<ReportPipeline> _logger;

  public ReportPipeline(
    IReportJobRepository jobRepository,
    IEnumerable<IReportGenerator> generators,
    IFileStorage fileStorage,
    ILogger<ReportPipeline> logger)
  {
    _jobRepository = jobRepository;
    _generators = generators;
    _fileStorage = fileStorage;
    _logger = logger;
  }

  public async Task ProcessAsync(Guid jobId, CancellationToken cancellationToken = default)
  {
    var stopwatch = Stopwatch.StartNew();
    _logger.LogInformation("Report pipeline started: jobId={JobId}", jobId);

    var job = await _jobRepository.GetByIdAsync(jobId, cancellationToken);
    if (job is null)
    {
      _logger.LogWarning("ReportJob {JobId} not found, skipping.", jobId);
      return;
    }

    try
    {
      var processingResult = job.MarkProcessing();
      if (processingResult.IsFailure)
      {
        _logger.LogWarning(
          "Cannot mark job {JobId} as processing: {Error}. Current status: {Status}",
          jobId, processingResult.Error!.Message, job.Status);
        return;
      }
      await _jobRepository.UpdateAsync(job, cancellationToken);

      var generator = _generators.FirstOrDefault(g => g.Type == job.Type)
        ?? throw new InvalidOperationException($"No generator registered for report type {job.Type}.");

      var context = new ReportContext(job.Id, job.Type, job.RequestedBy, job.ParametersJson);

      _logger.LogInformation("Generating report: jobId={JobId}, type={Type}", jobId, job.Type);

      await using var stream = await generator.GenerateAsync(context, cancellationToken);

      var fileKey = BuildFileKey(job.Id);
      const string contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      await _fileStorage.UploadAsync(stream, fileKey, contentType, cancellationToken);

      var completedResult = job.MarkCompleted(fileKey);
      if (completedResult.IsFailure)
        throw new InvalidOperationException(
          $"Failed to mark job as completed: {completedResult.Error!.Message}");

      await _jobRepository.UpdateAsync(job, cancellationToken);

      stopwatch.Stop();
      _logger.LogInformation(
        "Report pipeline completed: jobId={JobId}, fileKey={FileKey}, duration={DurationMs}ms",
        jobId, fileKey, stopwatch.ElapsedMilliseconds);
    }
    catch (OperationCanceledException)
    {
      _logger.LogWarning("Report pipeline cancelled: jobId={JobId}", jobId);
      throw;
    }
    catch (Exception ex)
    {
      stopwatch.Stop();
      _logger.LogError(ex,
        "Report pipeline failed: jobId={JobId}, duration={DurationMs}ms",
        jobId, stopwatch.ElapsedMilliseconds);

      var failedResult = job.MarkFailed(ex.Message);
      if (failedResult.IsSuccess)
      {
        try { await _jobRepository.UpdateAsync(job, CancellationToken.None); }
        catch (Exception updateEx)
        {
          _logger.LogError(updateEx, "Failed to mark job {JobId} as Failed.", jobId);
        }
      }

      throw;
    }
  }

  private static string BuildFileKey(Guid jobId)
  {
    var now = DateTime.UtcNow;
    return $"reports/{now:yyyy}/{now:MM}/{jobId}.xlsx";
  }
}