using MediatR;
using Finance.Application.Deposits.Commands.CloseDeposit;
using Finance.Application.Deposits.Commands.CreateDeposit;
using Finance.Application.Deposits.Commands.DeleteDeposit;
using Finance.Application.Deposits.Commands.RenameDeposit;
using Finance.Application.Deposits.Commands.TopUpDeposit;
using Finance.Application.Deposits.Queries.GetDepositById;
using Finance.Application.Deposits.Queries.GetDepositsByProfileId;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DepositController : ControllerBase
{

  private readonly IMediator _mediator;

  public DepositController(IMediator mediator)
  {
    _mediator = mediator;
  }

  [HttpPost]
  public async Task<IActionResult> Create([FromBody] CreateDepositCommand command)
  {
    var result = await _mediator.Send(command);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById(Guid id)
  {
    var result = await _mediator.Send(new GetDepositByIdQuery(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet]
  public async Task<IActionResult> GetByProfileId([FromQuery] Guid profileId)
  {
    var result = await _mediator.Send(new GetDepositsByProfileIdQuery(profileId));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPut("{id}/rename")]
  public async Task<IActionResult> Rename(Guid id, [FromBody] string newName)
  {
    var result = await _mediator.Send(new RenameDepositCommand(id, newName));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPost("{id}/top-up")]
  public async Task<IActionResult> TopUp(Guid id, [FromBody] decimal amount)
  {
    var result = await _mediator.Send(new TopUpDepositCommand(id, amount));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPatch("{id}/close")]
  public async Task<IActionResult> Close(Guid id)
  {
    var result = await _mediator.Send(new CloseDepositCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var result = await _mediator.Send(new DeleteDepositCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }
}
