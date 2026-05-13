namespace Finance.Application.Debts.Commands.ChangeDueDate;

public record ChangeDueDateCommand(Guid Id, DateOnly? NewDueDate);
