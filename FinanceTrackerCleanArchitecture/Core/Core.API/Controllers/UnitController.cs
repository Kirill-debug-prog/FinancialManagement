using MediatR;
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

  private readonly IMediator _mediator;

  public UnitController(IMediator mediator)
  {
    _mediator = mediator;
  }

  [HttpGet]
  public async Task<IActionResult> GetAll()
  {
    var result = await _mediator.Send(new GetAllUnitsQuery());
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("profile/{profileId}")]
  public async Task<IActionResult> GetByProfileId(Guid profileId)
  {
    var result = await _mediator.Send(new GetUnitsByProfileIdQuery(profileId));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPost]
  public async Task<IActionResult> Create([FromBody] CreateUnitCommand command)
  {
    var result = await _mediator.Send(command);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPut("{id}/rename")]
  public async Task<IActionResult> Rename(Guid id, [FromBody] RenameUnitRequest request)
  {
    var result = await _mediator.Send(new RenameUnitCommand(id, request.Name, request.ShortName));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var result = await _mediator.Send(new DeleteUnitCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }
}

public record RenameUnitRequest(string Name, string ShortName);
