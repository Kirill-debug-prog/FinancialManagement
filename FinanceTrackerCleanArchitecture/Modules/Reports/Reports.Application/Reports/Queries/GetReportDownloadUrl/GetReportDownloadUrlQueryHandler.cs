using Core.Domain.Common;
using Microsoft.Extensions.Configuration;
using Reports.Domain.Enums;
using Reports.Domain.Interfaces;

namespace Reports.Application.Reports.Queries.GetReportDownloadUrl;

public class GetReportDownloadUrlQueryHandler
{
  private readonly IReportJobRepository _jobRepository;
  private readonly IFileStorage _fileStorage;
  private readonly int _expirationMinutes;

  public GetReportDownloadUrlQueryHandler(
    IReportJobRepository jobRepository,
    IFileStorage fileStorage,
    IConfiguration configuration)
  {
    _jobRepository = jobRepository;
    _fileStorage = fileStorage;
    _expirationMinutes = configuration.GetValue<int>("S3:PresignedUrlExpirationMinutes", 15);
  }

  public async Task<Result<GetReportDownloadUrlResponse>> Handle(GetReportDownloadUrlQuery query, CancellationToken cancellationToken = default)
  {
    var job = await _jobRepository.GetByIdAsync(query.ReportId, cancellationToken);
    if (job is null)
      return Result<GetReportDownloadUrlResponse>.Failure(
        new DomainError("Report.NotFound", "Report not found."));

    if (job.RequestedBy != query.RequestedBy)
      return Result<GetReportDownloadUrlResponse>.Failure(
        new DomainError("Report.NotFound", "Report not found."));

    if (job.Status != ReportStatus.Completed)
      return Result<GetReportDownloadUrlResponse>.Failure(
        new DomainError("Report.NotReady", $"Report is not ready. Current status: {job.Status}."));

    if (string.IsNullOrEmpty(job.FileKey))
      return Result<GetReportDownloadUrlResponse>.Failure(
        new DomainError("Report.NoFile", "Report is marked completed but file key is missing."));

    var expiration = TimeSpan.FromMinutes(_expirationMinutes);
    var url = await _fileStorage.GeneratePresignedUrlAsync(job.FileKey, expiration, cancellationToken);

    return Result<GetReportDownloadUrlResponse>.Success(
      new GetReportDownloadUrlResponse(url, DateTime.UtcNow.Add(expiration)));
  }
}