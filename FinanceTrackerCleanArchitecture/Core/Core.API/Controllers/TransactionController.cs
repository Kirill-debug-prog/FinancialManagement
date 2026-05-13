using Finance.Application.Transactions.Commands.ChangeCategory;
using Finance.Application.Transactions.Commands.ChangeDescription;
using Finance.Application.Transactions.Commands.CreateTransaction;
using Finance.Application.Transactions.Commands.DeleteTransaction;
using Finance.Application.Transactions.Queries.GetTransactionById;
using Finance.Application.Transactions.Queries.GetTransactionsByWalletId;
using Finance.Application.Transactions.Queries.GetWalletBalance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionController : ControllerBase
{
  private readonly CreateTransactionCommandHandler _createTransactionHandler;
  private readonly DeleteTransactionCommandHandler _deleteTransactionHandler;
  private readonly ChangeDescriptionCommandHandler _changeDescriptionHandler;
  private readonly ChangeCategoryTransactionCommandHandler _changeCategoryHandler;
  private readonly GetTransactionByIdQueryHandler _getTransactionByIdHandler;
  private readonly GetTransactionsByWalletIdQueryHandler _getTransactionsByWalletIdHandler;
  private readonly GetWalletBalanceQueryHandler _getWalletBalanceHandler;

  public TransactionController(
    CreateTransactionCommandHandler createTransactionHandler,
    DeleteTransactionCommandHandler deleteTransactionHandler,
    ChangeDescriptionCommandHandler changeDescriptionHandler,
    ChangeCategoryTransactionCommandHandler changeCategoryHandler,
    GetTransactionByIdQueryHandler getTransactionByIdHandler,
    GetTransactionsByWalletIdQueryHandler getTransactionsByWalletIdHandler,
    GetWalletBalanceQueryHandler getWalletBalanceHandler)
  {
    _createTransactionHandler = createTransactionHandler;
    _deleteTransactionHandler = deleteTransactionHandler;
    _changeDescriptionHandler = changeDescriptionHandler;
    _changeCategoryHandler = changeCategoryHandler;
    _getTransactionByIdHandler = getTransactionByIdHandler;
    _getTransactionsByWalletIdHandler = getTransactionsByWalletIdHandler;
    _getWalletBalanceHandler = getWalletBalanceHandler;
  }

  [HttpPost]
  public async Task<IActionResult> Create([FromBody] CreateTransactionCommand command)
  {
    var result = await _createTransactionHandler.Handle(command);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById(Guid id)
  {
    var result = await _getTransactionByIdHandler.Handle(new GetTransactionByIdQuery(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet]
  public async Task<IActionResult> GetByWalletId([FromQuery] Guid walletId)
  {
    var result = await _getTransactionsByWalletIdHandler.Handle(new GetTransactionsByWalletIdQuery(walletId));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("balance")]
  public async Task<IActionResult> GetWalletBalance([FromQuery] Guid walletId)
  {
    var result = await _getWalletBalanceHandler.Handle(new GetWalletBalanceQuery(walletId));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPatch("{id}/description")]
  public async Task<IActionResult> ChangeDescription(Guid id, [FromBody] string? newDescription)
  {
    var result = await _changeDescriptionHandler.Handle(new ChangeDescriptionCommand(id, newDescription));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPatch("{id}/category")]
  public async Task<IActionResult> ChangeCategory(Guid id, [FromBody] Guid? newCategoryId)
  {
    var result = await _changeCategoryHandler.Handle(new ChangeCategoryTransactionCommand(id, newCategoryId));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var result = await _deleteTransactionHandler.Handle(new DeleteTransactionCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }
}
