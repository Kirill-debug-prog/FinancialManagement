using Finance.Application.Units.Commands.CreateUnit;
using Finance.Application.Units.Commands.DeleteUnit;
using Finance.Application.Units.Commands.RenameUnit;
using Finance.Application.Units.Queries.GetAllUnits;
using Finance.Application.Units.Queries.GetUnitsByProfileId;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UnitController : ControllerBase
{
  private readonly CreateUnitCommandHandler _createUnitHandler;
  private readonly DeleteUnitCommandHandler _deleteUnitHandler;
  private readonly RenameUnitCommandHandler _renameUnitHandler;
  private readonly GetAllUnitsQueryHandler _getAllUnitsHandler;
  private readonly GetUnitsByProfileIdQueryHandler _getUnitsByProfileIdHandler;

  public UnitController(
    CreateUnitCommandHandler createUnitHandler,
    DeleteUnitCommandHandler deleteUnitHandler,
    RenameUnitCommandHandler renameUnitHandler,
    GetAllUnitsQueryHandler getAllUnitsHandler,
    GetUnitsByProfileIdQueryHandler getUnitsByProfileIdHandler)
  {
    _createUnitHandler = createUnitHandler;
    _deleteUnitHandler = deleteUnitHandler;
    _renameUnitHandler = renameUnitHandler;
    _getAllUnitsHandler = getAllUnitsHandler;
    _getUnitsByProfileIdHandler = getUnitsByProfileIdHandler;
  }

  [HttpGet]
  public async Task<IActionResult> GetAll()
  {
    var result = await _getAllUnitsHandler.Handle(new GetAllUnitsQuery());
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("profile/{profileId}")]
  public async Task<IActionResult> GetByProfileId(Guid profileId)
  {
    var result = await _getUnitsByProfileIdHandler.Handle(new GetUnitsByProfileIdQuery(profileId));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPost]
  public async Task<IActionResult> Create([FromBody] CreateUnitCommand command)
  {
    var result = await _createUnitHandler.Handle(command);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPut("{id}/rename")]
  public async Task<IActionResult> Rename(Guid id, [FromBody] RenameUnitRequest request)
  {
    var result = await _renameUnitHandler.Handle(new RenameUnitCommand(id, request.Name, request.ShortName));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var result = await _deleteUnitHandler.Handle(new DeleteUnitCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }
}

public record RenameUnitRequest(string Name, string ShortName);
