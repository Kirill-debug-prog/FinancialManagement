using MediatR;
using Finance.Application.Debts.Commands.ChangeDueDate;
using Finance.Application.Debts.Commands.CreateDebt;
using Finance.Application.Debts.Commands.DeleteDebt;
using Finance.Application.Debts.Commands.MakePayment;
using Finance.Application.Debts.Commands.RenameCreditor;
using Finance.Application.Debts.Commands.RepayDebt;
using Finance.Application.Debts.Queries.GetDebtById;
using Finance.Application.Debts.Queries.GetDebtsByProfileId;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DebtController : ControllerBase
{

  private readonly IMediator _mediator;

  public DebtController(IMediator mediator)
  {
    _mediator = mediator;
  }

  [HttpPost]
  public async Task<IActionResult> Create([FromBody] CreateDebtCommand command)
  {
    var result = await _mediator.Send(command);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById(Guid id)
  {
    var result = await _mediator.Send(new GetDebtByIdQuery(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet]
  public async Task<IActionResult> GetByProfileId([FromQuery] Guid profileId)
  {
    var result = await _mediator.Send(new GetDebtsByProfileIdQuery(profileId));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPut("{id}/creditor")]
  public async Task<IActionResult> RenameCreditor(Guid id, [FromBody] string newCreditorName)
  {
    var result = await _mediator.Send(new RenameCreditorCommand(id, newCreditorName));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPost("{id}/payment")]
  public async Task<IActionResult> MakePayment(Guid id, [FromBody] decimal amount)
  {
    var result = await _mediator.Send(new MakeDebtPaymentCommand(id, amount));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPatch("{id}/due-date")]
  public async Task<IActionResult> ChangeDueDate(Guid id, [FromBody] DateOnly? newDueDate)
  {
    var result = await _mediator.Send(new ChangeDueDateCommand(id, newDueDate));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPatch("{id}/repay")]
  public async Task<IActionResult> Repay(Guid id)
  {
    var result = await _mediator.Send(new RepayDebtCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var result = await _mediator.Send(new DeleteDebtCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }
}
