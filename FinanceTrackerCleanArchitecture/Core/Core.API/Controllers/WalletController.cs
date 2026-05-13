using Finance.Application.Wallets.Commands.ChangeCurrency;
using Finance.Application.Wallets.Commands.ChangeIcon;
using Finance.Application.Wallets.Commands.ChangeNote;
using Finance.Application.Wallets.Commands.ChangeSortOrder;
using Finance.Application.Wallets.Commands.CreateWallet;
using Finance.Application.Wallets.Commands.DeleteWallet;
using Finance.Application.Wallets.Commands.RenameWallet;
using Finance.Application.Wallets.Queries.GetWalletById;
using Finance.Application.Wallets.Queries.GetWalletsByProfileId;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WalletController : ControllerBase
{
  private readonly CreateWalletCommandHandler _createWalletHandler;
  private readonly DeleteWalletCommandHandler _deleteWalletHandler;
  private readonly RenameWalletCommandHandler _renameWalletHandler;
  private readonly ChangeSortOrderCommandHandler _changeSortOrderHandler;
  private readonly ChangeIconCommandHandler _changeIconHandler;
  private readonly ChangeCurrencyCommandHandler _changeCurrencyHandler;
  private readonly ChangeNoteCommandHandler _changeNoteHandler;
  private readonly GetWalletByIdQueryHandler _getWalletByIdHandler;
  private readonly GetWalletsByProfileIdQueryHandler _getWalletsByProfileIdHandler;

  public WalletController(
    CreateWalletCommandHandler createWalletHandler,
    DeleteWalletCommandHandler deleteWalletHandler,
    RenameWalletCommandHandler renameWalletHandler,
    ChangeSortOrderCommandHandler changeSortOrderHandler,
    ChangeIconCommandHandler changeIconHandler,
    ChangeCurrencyCommandHandler changeCurrencyHandler,
    ChangeNoteCommandHandler changeNoteHandler,
    GetWalletByIdQueryHandler getWalletByIdHandler,
    GetWalletsByProfileIdQueryHandler getWalletsByProfileIdHandler)
  {
    _createWalletHandler = createWalletHandler;
    _deleteWalletHandler = deleteWalletHandler;
    _renameWalletHandler = renameWalletHandler;
    _changeSortOrderHandler = changeSortOrderHandler;
    _changeIconHandler = changeIconHandler;
    _changeCurrencyHandler = changeCurrencyHandler;
    _changeNoteHandler = changeNoteHandler;
    _getWalletByIdHandler = getWalletByIdHandler;
    _getWalletsByProfileIdHandler = getWalletsByProfileIdHandler;
  }

  [HttpPost]
  public async Task<IActionResult> Create([FromBody] CreateWalletCommand command)
  {
    var result = await _createWalletHandler.Handle(command);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById(Guid id)
  {
    var result = await _getWalletByIdHandler.Handle(new GetWalletByIdQuery(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet]
  public async Task<IActionResult> GetByProfileId([FromQuery] Guid profileId)
  {
    var result = await _getWalletsByProfileIdHandler.Handle(new GetWalletsByProfileIdQuery(profileId));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPut("{id}/rename")]
  public async Task<IActionResult> Rename(Guid id, [FromBody] string newName)
  {
    var result = await _renameWalletHandler.Handle(new RenameWalletCommand(id, newName));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPatch("{id}/sort-order")]
  public async Task<IActionResult> ChangeSortOrder(Guid id, [FromBody] int newSortOrder)
  {
    var result = await _changeSortOrderHandler.Handle(new ChangeSortOrderCommand(id, newSortOrder));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPatch("{id}/icon")]
  public async Task<IActionResult> ChangeIcon(Guid id, [FromBody] string? newIcon)
  {
    var result = await _changeIconHandler.Handle(new ChangeIconCommand(id, newIcon));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPatch("{id}/currency")]
  public async Task<IActionResult> ChangeCurrency(Guid id, [FromBody] Guid newCurrencyId)
  {
    var result = await _changeCurrencyHandler.Handle(new ChangeCurrencyCommand(id, newCurrencyId));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPatch("{id}/note")]
  public async Task<IActionResult> ChangeNote(Guid id, [FromBody] string? newNote)
  {
    var result = await _changeNoteHandler.Handle(new ChangeNoteCommand(id, newNote));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var result = await _deleteWalletHandler.Handle(new DeleteWalletCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }
}
