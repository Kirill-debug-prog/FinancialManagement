using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Transactions.Commands.ChangeCategory;

public class ChangeCategoryTransactionCommandHandler
{
  private readonly ITransactionRepository _transactionRepository;

  public ChangeCategoryTransactionCommandHandler(ITransactionRepository transactionRepository)
  {
    _transactionRepository = transactionRepository;
  }

  public async Task<Result<bool>> Handle(ChangeCategoryTransactionCommand command)
  {
    var transaction = await _transactionRepository.GetByIdAsync(command.Id);
    if (transaction is null)
      return Result<bool>.Failure(new DomainError("Transaction.NotFound", "Transaction not found."));

    transaction.ChangeCategory(command.NewCategoryId);
    await _transactionRepository.UpdateAsync(transaction);
    return Result<bool>.Success(true);
  }
}
