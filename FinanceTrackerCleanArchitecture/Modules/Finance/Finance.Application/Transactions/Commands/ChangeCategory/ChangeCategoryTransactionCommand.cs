namespace Finance.Application.Transactions.Commands.ChangeCategory;

public record ChangeCategoryTransactionCommand(Guid Id, Guid? NewCategoryId);
