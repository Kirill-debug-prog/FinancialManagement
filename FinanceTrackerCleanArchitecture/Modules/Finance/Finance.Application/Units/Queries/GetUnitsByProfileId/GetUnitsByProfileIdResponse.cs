namespace Finance.Application.Units.Queries.GetUnitsByProfileId;

public record GetUnitsByProfileIdResponse(Guid Id, string Name, string ShortName, bool IsSystem);
