namespace Users.Application.Profiles.Commands.RenameProfile;

public record RenameProfileCommand(Guid Id, string NewName);
