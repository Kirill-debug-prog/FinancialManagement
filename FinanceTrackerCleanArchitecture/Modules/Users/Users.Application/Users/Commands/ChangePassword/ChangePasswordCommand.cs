namespace Users.Application.Users.Commands.ChangePassword;

public record ChangePasswordCommand(Guid Id, string CurrentPassword, string NewPassword);
