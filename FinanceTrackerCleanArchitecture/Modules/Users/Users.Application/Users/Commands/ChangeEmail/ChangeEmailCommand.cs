namespace Users.Application.Users.Commands.ChangeEmail;

public record ChangeEmailCommand(Guid Id, string NewEmail);
