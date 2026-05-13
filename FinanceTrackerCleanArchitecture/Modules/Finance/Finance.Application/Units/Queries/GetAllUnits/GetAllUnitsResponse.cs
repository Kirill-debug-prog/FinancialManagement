namespace Finance.Application.Units.Queries.GetAllUnits;

public record GetAllUnitsResponse(Guid Id, string Name, string ShortName, bool IsSystem);
