using MediatR;
using Core.Domain.Common;
using Hangfire;
using Reports.Domain.Entities;
using Reports.Domain.Interfaces;

namespace Reports.Application.Reports.Commands.CreateReport;

public class CreateReportCommandHandler : IRequestHandler<CreateReportCommand, Result<CreateReportResponse>>
{
  private readonly IReportJobRepository _jobRepository;
  private readonly IBackgroundJobClient _backgroundJobClient;

  public CreateReportCommandHandler(
    IReportJobRepository jobRepository,
    IBackgroundJobClient backgroundJobClient)
  {
    _jobRepository = jobRepository;
    _backgroundJobClient = backgroundJobClient;
  }

  public async Task<Result<CreateReportResponse>> Handle(CreateReportCommand command, CancellationToken cancellationToken = default)
  {
    var jobResult = ReportJob.Create(command.Type, command.RequestedBy, command.ParametersJson);
    if (jobResult.IsFailure)
      return Result<CreateReportResponse>.Failure(jobResult.Error!);

    var job = jobResult.Value!;
    await _jobRepository.CreateAsync(job, cancellationToken);

    _backgroundJobClient.Enqueue<IReportPipeline>("reports", pipeline =>
      pipeline.ProcessAsync(job.Id, CancellationToken.None));

    return Result<CreateReportResponse>.Success(new CreateReportResponse(job.Id));
  }
}