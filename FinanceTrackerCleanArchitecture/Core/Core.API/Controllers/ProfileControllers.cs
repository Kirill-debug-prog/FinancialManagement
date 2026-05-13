using Users.Application.Profiles.Commands.CreateProfile;
using Users.Application.Profiles.Commands.DeleteProfile;
using Users.Application.Profiles.Commands.RenameProfile;
using Users.Application.Profiles.Commands.ToggleProfileActive;
using Users.Application.Profiles.Queries.GetProfileById;
using Users.Application.Profiles.Queries.GetProfilesByUserId;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
  private readonly CreateProfileCommandHandler _createProfileHandler;
  private readonly DeleteProfileCommandHandler _deleteProfileHandler;
  private readonly RenameProfileCommandHandler _renameProfileHandler;
  private readonly ToggleProfileActiveCommandHandler _toggleProfileActiveHandler;
  private readonly GetProfilesByUserIdQueryHandler _getProfilesByUserIdHandler;
  private readonly GetProfileByIdQueryHandler _getProfileByIdHandler;

  public ProfileController(
    CreateProfileCommandHandler createProfileCommandHandler,
    DeleteProfileCommandHandler deleteProfileCommandHandler,
    RenameProfileCommandHandler renameProfileCommandHandler,
    ToggleProfileActiveCommandHandler toggleProfileActiveCommandHandler,
    GetProfilesByUserIdQueryHandler getProfilesByUserIdQueryHandler,
    GetProfileByIdQueryHandler getProfileByIdQueryHandler)
  {
    _createProfileHandler = createProfileCommandHandler;
    _deleteProfileHandler = deleteProfileCommandHandler;
    _renameProfileHandler = renameProfileCommandHandler;
    _toggleProfileActiveHandler = toggleProfileActiveCommandHandler;
    _getProfilesByUserIdHandler = getProfilesByUserIdQueryHandler;
    _getProfileByIdHandler = getProfileByIdQueryHandler;
  }

  [HttpPost]
  public async Task<IActionResult> Create([FromBody] CreateProfileCommand command)
  {
    var result = await _createProfileHandler.Handle(command);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet]
  public async Task<IActionResult> GetByUserId([FromQuery] GetProfilesByUserIdQuery query)
  {
    var result = await _getProfilesByUserIdHandler.Handle(query);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById(Guid id)
  {
    var result = await _getProfileByIdHandler.Handle(new GetProfileByIdQuery(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPut("{id}/rename")]
  public async Task<IActionResult> Rename(Guid id, [FromBody] string newName)
  {
    var result = await _renameProfileHandler.Handle(new RenameProfileCommand(id, newName));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPatch("{id}/toggle-active")]
  public async Task<IActionResult> ToggleActive(Guid id)
  {
    var result = await _toggleProfileActiveHandler.Handle(new ToggleProfileActiveCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var result = await _deleteProfileHandler.Handle(new DeleteProfileCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }
}