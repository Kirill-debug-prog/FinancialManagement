namespace Users.Application.Users.Commands.ChangeProfile;

public record ChangeProfileCommand(Guid UserId, string? FirstName, string? LastName, string? PhoneNumber);
