using System.Security.Claims;
using System.Text.Json;
using Core.API.Contracts.Reports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Reports.Application.Reports.Commands.CreateReport;
using Reports.Application.Reports.Queries.GetReportDownloadUrl;
using Reports.Application.Reports.Queries.GetReportStatus;
using Reports.Domain.Enums;

namespace Core.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
  private static readonly JsonSerializerOptions JsonOptions = new()
  {
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
  };

  private readonly CreateReportCommandHandler _createReportHandler;
  private readonly GetReportStatusQueryHandler _getReportStatusHandler;
  private readonly GetReportDownloadUrlQueryHandler _getReportDownloadUrlHandler;

  public ReportsController(
    CreateReportCommandHandler createReportHandler,
    GetReportStatusQueryHandler getReportStatusHandler,
    GetReportDownloadUrlQueryHandler getReportDownloadUrlHandler)
  {
    _createReportHandler = createReportHandler;
    _getReportStatusHandler = getReportStatusHandler;
    _getReportDownloadUrlHandler = getReportDownloadUrlHandler;
  }

  [HttpPost("profile-transactions")]
  public async Task<IActionResult> CreateProfileTransactionsReport(
    [FromBody] CreateProfileTransactionsReportRequest request,
    CancellationToken cancellationToken)
  {
    if (!TryGetUserId(out var userId))
      return Unauthorized();

    if (request.From > request.To)
      return BadRequest(new { error = "'From' date must be before or equal to 'To' date." });

    var parameters = JsonSerializer.Serialize(new
    {
      profileId = request.ProfileId,
      from = request.From,
      to = request.To
    }, JsonOptions);

    var command = new CreateReportCommand(ReportType.ProfileTransactions, userId, parameters);
    var result = await _createReportHandler.Handle(command, cancellationToken);

    if (result.IsFailure)
      return BadRequest(result.Error);

    return Ok(result.Value);
  }

  [HttpGet("{id:guid}")]
  public async Task<IActionResult> GetStatus(Guid id, CancellationToken cancellationToken)
  {
    if (!TryGetUserId(out var userId))
      return Unauthorized();

    var result = await _getReportStatusHandler.Handle(
      new GetReportStatusQuery(id, userId), cancellationToken);

    if (result.IsFailure)
    {
      if (result.Error!.Code == "Report.NotFound")
        return NotFound(result.Error);
      return BadRequest(result.Error);
    }

    return Ok(result.Value);
  }

  [HttpGet("{id:guid}/download")]
  public async Task<IActionResult> GetDownloadUrl(Guid id, CancellationToken cancellationToken)
  {
    if (!TryGetUserId(out var userId))
      return Unauthorized();

    var result = await _getReportDownloadUrlHandler.Handle(
      new GetReportDownloadUrlQuery(id, userId), cancellationToken);

    if (result.IsFailure)
    {
      if (result.Error!.Code == "Report.NotFound")
        return NotFound(result.Error);
      if (result.Error.Code == "Report.NotReady")
        return Conflict(result.Error);
      return BadRequest(result.Error);
    }

    return Ok(result.Value);
  }

  private bool TryGetUserId(out Guid userId)
  {
    var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier)
      ?? User.FindFirstValue("sub");

    return Guid.TryParse(userIdString, out userId);
  }
}