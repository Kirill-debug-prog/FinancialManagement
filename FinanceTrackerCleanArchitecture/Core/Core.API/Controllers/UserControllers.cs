using Users.Application.Users.Commands.ChangeEmail;
using Users.Application.Users.Commands.ChangePassword;
using Users.Application.Users.Commands.ChangeProfile;
using Users.Application.Users.Commands.DeleteUser;
using Users.Application.Users.Commands.LoginUser;
using Users.Application.Users.Commands.RegisterUser;
using Users.Application.Users.Queries.GetUserById;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
  private readonly RegisterUserCommandHandler _registerHandler;
  private readonly LoginUserCommandHandler _loginHandler;
  private readonly DeleteUserCommandHandler _deleteUserHandler;
  private readonly ChangeEmailCommandHandler _changeEmailHandler;
  private readonly ChangePasswordCommandHandler _changePasswordHandler;
  private readonly ChangeProfileCommandHandler _changeProfileHandler;
  private readonly GetUserByIdQueryHandler _getUserByIdHandler;

  public UserController(
    RegisterUserCommandHandler registerHandler,
    LoginUserCommandHandler loginHandler,
    DeleteUserCommandHandler deleteUserHandler,
    ChangeEmailCommandHandler changeEmailHandler,
    ChangePasswordCommandHandler changePasswordHandler,
    ChangeProfileCommandHandler changeProfileHandler,
    GetUserByIdQueryHandler getUserByIdQueryHandler)
  {
    _registerHandler = registerHandler;
    _loginHandler = loginHandler;
    _deleteUserHandler = deleteUserHandler;
    _changeEmailHandler = changeEmailHandler;
    _changePasswordHandler = changePasswordHandler;
    _changeProfileHandler = changeProfileHandler;
    _getUserByIdHandler = getUserByIdQueryHandler;
  }

  [AllowAnonymous]
  [HttpPost("register")]
  public async Task<IActionResult> Register([FromBody] RegisterUserCommand command)
  {
    var result = await _registerHandler.Handle(command);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [AllowAnonymous]
  [HttpPost("login")]
  public async Task<IActionResult> Login([FromBody] LoginUserCommand command)
  {
    var result = await _loginHandler.Handle(command);
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById(Guid id)
  {
    var result = await _getUserByIdHandler.Handle(new GetUserByIdQuery(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return Ok(result.Value);
  }

  [HttpPut("{id}/change-email")]
  public async Task<IActionResult> ChangeEmail(Guid id, [FromBody] string newEmail)
  {
    var result = await _changeEmailHandler.Handle(new ChangeEmailCommand(id, newEmail));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPut("{id}/change-password")]
  public async Task<IActionResult> ChangePassword(Guid id, [FromBody] ChangePasswordRequest request)
  {
    var result = await _changePasswordHandler.Handle(new ChangePasswordCommand(id, request.CurrentPassword, request.NewPassword));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpPut("{id}/change-profile")]
  public async Task<IActionResult> ChangeProfile(Guid id, [FromBody] ChangeProfileRequest request)
  {
    var result = await _changeProfileHandler.Handle(new ChangeProfileCommand(id, request.FirstName, request.LastName, request.PhoneNumber));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var result = await _deleteUserHandler.Handle(new DeleteUserCommand(id));
    if (result.IsFailure)
      return BadRequest(result.Error);
    return NoContent();
  }
}

public record ChangeProfileRequest(string? FirstName, string? LastName, string? PhoneNumber);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);