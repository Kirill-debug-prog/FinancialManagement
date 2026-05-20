using MediatR;
using System.Security.Claims;
using System.Text.Json;
using Reports.Application.Reports.Commands.CreateReport;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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


  private readonly IMediator _mediator;

  public ReportsController(IMediator mediator)
  {
    _mediator = mediator;
  }

  [HttpPost("profile-transactions")]
  public async Task<IActionResult> CreateProfileTransactionsReport(
    [FromBody] CreateProfileTransactionsReportRequest request,
    CancellationToken cancellationToken)
  {
    var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
    if (!Guid.TryParse(userIdString, out var userId))
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
    var result = await _mediator.Send(command, cancellationToken);

    if (result.IsFailure)
      return BadRequest(result.Error);

    return Ok(result.Value);
  }

  [HttpGet("{id:guid}")]
  public async Task<IActionResult> GetStatus(Guid id, CancellationToken cancellationToken)
  {
    var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
    if (!Guid.TryParse(userIdString, out var userId))
      return Unauthorized();

    var result = await _mediator.Send(
      new GetReportStatusQuery(id, userId), cancellationToken);

    if (result.IsFailure)
    {
      if (result.Error!.Code == "Report.NotFound")
        return NotFound(result.Error);
      return BadRequest(result.Error);
    }

    return Ok(result.Value);
  }

  [HttpPost("category-breakdown")]
  public async Task<IActionResult> CreateCategoryBreakdownReport(
    [FromBody] CreateCategoryBreakdownReportRequest request,
    CancellationToken cancellationToken)
  {
    var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
    if (!Guid.TryParse(userIdString, out var userId))
      return Unauthorized();

    if (request.From > request.To)
      return BadRequest(new { error = "'From' date must be before or equal to 'To' date." });

    var parameters = JsonSerializer.Serialize(new
    {
      profileId = request.ProfileId,
      from = request.From,
      to = request.To
    }, JsonOptions);

    var command = new CreateReportCommand(ReportType.CategoryBreakdown, userId, parameters);
    var result = await _mediator.Send(command, cancellationToken);

    if (result.IsFailure)
      return BadRequest(result.Error);

    return Ok(result.Value);
  }

  [HttpPost("financial-obligations")]
  public async Task<IActionResult> CreateFinancialObligationsReport(
    [FromBody] CreateFinancialObligationsReportRequest request,
    CancellationToken cancellationToken)
  {
    var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
    if (!Guid.TryParse(userIdString, out var userId))
      return Unauthorized();

    var parameters = JsonSerializer.Serialize(new
    {
      profileId = request.ProfileId,
      from = request.From,
      to = request.To
    }, JsonOptions);

    var command = new CreateReportCommand(ReportType.FinancialObligations, userId, parameters);
    var result = await _mediator.Send(command, cancellationToken);

    if (result.IsFailure)
      return BadRequest(result.Error);

    return Ok(result.Value);
  }

  [HttpGet("{id:guid}/download")]
  public async Task<IActionResult> GetDownloadUrl(Guid id, CancellationToken cancellationToken)
  {
    var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
    if (!Guid.TryParse(userIdString, out var userId))
      return Unauthorized();

    var result = await _mediator.Send(
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
}
