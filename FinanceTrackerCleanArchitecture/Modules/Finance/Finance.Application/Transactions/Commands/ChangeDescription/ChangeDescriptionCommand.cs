namespace Finance.Application.Transactions.Commands.ChangeDescription;

public record ChangeDescriptionCommand(Guid Id, string? NewDescription);
