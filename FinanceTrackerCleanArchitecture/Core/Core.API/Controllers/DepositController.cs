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
  private readonly CreateDepositCommandHandler _createDepositHandler;
  private readonly DeleteDepositCommandHandler _deleteDepositHandler;
  private readonly RenameDepositCommandHandler _renameDepositHandler;
  private readonly TopUpDepositCommandHandler _topUpDepositHandler;
  private readonly CloseDepositCommandHandler _closeDepositHandler;
  private readonly GetDepositByIdQueryHandler _getDepositByIdHandler;
  private readonly GetDepositsByProfileIdQueryHandler _getDepositsByProfileIdHandler;

  public DepositController(
    CreateDepositCommandHandler createDepositHandler,
    DeleteDepositCommandHandler deleteDepositHandler,
    RenameDepositCommandHandler renameDepositHandler,
    TopUpDepositCommandHandler topUpDepositHandler,
    CloseDepositCommandHandler closeDepositHandler,
    GetDepositByIdQueryHandler getDepositByIdHandler,
    GetDepositsByProfileIdQueryHandler getDepositsByProfileIdHandler)
  {
    _createDepositHandler = createDepositHandler;
    _deleteDepositHandler = deleteDepositHandler;
    _renameDepositHandler = renameDepositHandler;
    _topUpDepositHandler = topUpDepositHandler;
    _closeDepositHandler = closeDepositHandler;
    _getDepositByIdHandler = getDepositByIdHandler;
    _getDepositsByProfileIdHandler = getDepositsByProfileIdHandler;
  }

  [HttpPost]
  public async Task<IActionResult> Create([FromBody] CreateDepositCommand command)
  {
    var result = await _createDepositHandler.Handle(command);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById(Guid id)
  {
    var result = await _getDepositByIdHandler.Handle(new GetDepositByIdQuery(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet]
  public async Task<IActionResult> GetByProfileId([FromQuery] Guid profileId)
  {
    var result = await _getDepositsByProfileIdHandler.Handle(new GetDepositsByProfileIdQuery(profileId));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPut("{id}/rename")]
  public async Task<IActionResult> Rename(Guid id, [FromBody] string newName)
  {
    var result = await _renameDepositHandler.Handle(new RenameDepositCommand(id, newName));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPost("{id}/top-up")]
  public async Task<IActionResult> TopUp(Guid id, [FromBody] decimal amount)
  {
    var result = await _topUpDepositHandler.Handle(new TopUpDepositCommand(id, amount));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPatch("{id}/close")]
  public async Task<IActionResult> Close(Guid id)
  {
    var result = await _closeDepositHandler.Handle(new CloseDepositCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var result = await _deleteDepositHandler.Handle(new DeleteDepositCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }
}
