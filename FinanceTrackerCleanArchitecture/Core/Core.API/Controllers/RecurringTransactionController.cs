using MediatR;
using Finance.Application.RecurringTransactions.Commands.CreateRecurringTransaction;
using Finance.Application.RecurringTransactions.Commands.DeactivateRecurringTransaction;
using Finance.Application.RecurringTransactions.Commands.DeleteRecurringTransaction;
using Finance.Application.RecurringTransactions.Queries.GetRecurringTransactionById;
using Finance.Application.RecurringTransactions.Queries.GetRecurringTransactionsByWalletId;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RecurringTransactionController : ControllerBase
{

  private readonly IMediator _mediator;

  public RecurringTransactionController(IMediator mediator)
  {
    _mediator = mediator;
  }

  [HttpPost]
  public async Task<IActionResult> Create([FromBody] CreateRecurringTransactionCommand command)
  {
    var result = await _mediator.Send(command);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById(Guid id)
  {
    var result = await _mediator.Send(new GetRecurringTransactionByIdQuery(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet]
  public async Task<IActionResult> GetByWalletId([FromQuery] Guid walletId)
  {
    var result = await _mediator.Send(new GetRecurringTransactionsByWalletIdQuery(walletId));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPatch("{id}/deactivate")]
  public async Task<IActionResult> Deactivate(Guid id)
  {
    var result = await _mediator.Send(new DeactivateRecurringTransactionCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var result = await _mediator.Send(new DeleteRecurringTransactionCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }
}
