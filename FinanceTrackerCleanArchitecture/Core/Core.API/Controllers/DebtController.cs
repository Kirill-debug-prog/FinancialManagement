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
  private readonly CreateDebtCommandHandler _createDebtHandler;
  private readonly DeleteDebtCommandHandler _deleteDebtHandler;
  private readonly RenameCreditorCommandHandler _renameCreditorHandler;
  private readonly MakeDebtPaymentCommandHandler _makePaymentHandler;
  private readonly ChangeDueDateCommandHandler _changeDueDateHandler;
  private readonly RepayDebtCommandHandler _repayDebtHandler;
  private readonly GetDebtByIdQueryHandler _getDebtByIdHandler;
  private readonly GetDebtsByProfileIdQueryHandler _getDebtsByProfileIdHandler;

  public DebtController(
    CreateDebtCommandHandler createDebtHandler,
    DeleteDebtCommandHandler deleteDebtHandler,
    RenameCreditorCommandHandler renameCreditorHandler,
    MakeDebtPaymentCommandHandler makePaymentHandler,
    ChangeDueDateCommandHandler changeDueDateHandler,
    RepayDebtCommandHandler repayDebtHandler,
    GetDebtByIdQueryHandler getDebtByIdHandler,
    GetDebtsByProfileIdQueryHandler getDebtsByProfileIdHandler)
  {
    _createDebtHandler = createDebtHandler;
    _deleteDebtHandler = deleteDebtHandler;
    _renameCreditorHandler = renameCreditorHandler;
    _makePaymentHandler = makePaymentHandler;
    _changeDueDateHandler = changeDueDateHandler;
    _repayDebtHandler = repayDebtHandler;
    _getDebtByIdHandler = getDebtByIdHandler;
    _getDebtsByProfileIdHandler = getDebtsByProfileIdHandler;
  }

  [HttpPost]
  public async Task<IActionResult> Create([FromBody] CreateDebtCommand command)
  {
    var result = await _createDebtHandler.Handle(command);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById(Guid id)
  {
    var result = await _getDebtByIdHandler.Handle(new GetDebtByIdQuery(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet]
  public async Task<IActionResult> GetByProfileId([FromQuery] Guid profileId)
  {
    var result = await _getDebtsByProfileIdHandler.Handle(new GetDebtsByProfileIdQuery(profileId));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPut("{id}/creditor")]
  public async Task<IActionResult> RenameCreditor(Guid id, [FromBody] string newCreditorName)
  {
    var result = await _renameCreditorHandler.Handle(new RenameCreditorCommand(id, newCreditorName));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPost("{id}/payment")]
  public async Task<IActionResult> MakePayment(Guid id, [FromBody] decimal amount)
  {
    var result = await _makePaymentHandler.Handle(new MakeDebtPaymentCommand(id, amount));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPatch("{id}/due-date")]
  public async Task<IActionResult> ChangeDueDate(Guid id, [FromBody] DateOnly? newDueDate)
  {
    var result = await _changeDueDateHandler.Handle(new ChangeDueDateCommand(id, newDueDate));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPatch("{id}/repay")]
  public async Task<IActionResult> Repay(Guid id)
  {
    var result = await _repayDebtHandler.Handle(new RepayDebtCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var result = await _deleteDebtHandler.Handle(new DeleteDebtCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }
}
