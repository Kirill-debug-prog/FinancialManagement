namespace Users.Application.Profiles.Queries.GetProfileById;

public record GetProfileByIdResponse(Guid Id, string Name, bool IsActive);