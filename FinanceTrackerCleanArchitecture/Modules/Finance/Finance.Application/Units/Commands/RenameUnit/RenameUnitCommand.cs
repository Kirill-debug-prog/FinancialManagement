namespace Finance.Application.Units.Commands.RenameUnit;

public record RenameUnitCommand(Guid Id, string Name, string ShortName);
