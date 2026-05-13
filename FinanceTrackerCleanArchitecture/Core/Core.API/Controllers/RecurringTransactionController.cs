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
  private readonly CreateRecurringTransactionCommandHandler _createHandler;
  private readonly DeleteRecurringTransactionCommandHandler _deleteHandler;
  private readonly DeactivateRecurringTransactionCommandHandler _deactivateHandler;
  private readonly GetRecurringTransactionByIdQueryHandler _getByIdHandler;
  private readonly GetRecurringTransactionsByWalletIdQueryHandler _getByWalletIdHandler;

  public RecurringTransactionController(
    CreateRecurringTransactionCommandHandler createHandler,
    DeleteRecurringTransactionCommandHandler deleteHandler,
    DeactivateRecurringTransactionCommandHandler deactivateHandler,
    GetRecurringTransactionByIdQueryHandler getByIdHandler,
    GetRecurringTransactionsByWalletIdQueryHandler getByWalletIdHandler)
  {
    _createHandler = createHandler;
    _deleteHandler = deleteHandler;
    _deactivateHandler = deactivateHandler;
    _getByIdHandler = getByIdHandler;
    _getByWalletIdHandler = getByWalletIdHandler;
  }

  [HttpPost]
  public async Task<IActionResult> Create([FromBody] CreateRecurringTransactionCommand command)
  {
    var result = await _createHandler.Handle(command);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById(Guid id)
  {
    var result = await _getByIdHandler.Handle(new GetRecurringTransactionByIdQuery(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet]
  public async Task<IActionResult> GetByWalletId([FromQuery] Guid walletId)
  {
    var result = await _getByWalletIdHandler.Handle(new GetRecurringTransactionsByWalletIdQuery(walletId));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPatch("{id}/deactivate")]
  public async Task<IActionResult> Deactivate(Guid id)
  {
    var result = await _deactivateHandler.Handle(new DeactivateRecurringTransactionCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var result = await _deleteHandler.Handle(new DeleteRecurringTransactionCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }
}
