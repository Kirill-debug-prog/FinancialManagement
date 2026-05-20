using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Transactions.Commands.DeleteTransaction;

public class DeleteTransactionCommandHandler : IRequestHandler<DeleteTransactionCommand, Result<bool>>
{
  private readonly ITransactionRepository _transactionRepository;

  public DeleteTransactionCommandHandler(ITransactionRepository transactionRepository)
  {
    _transactionRepository = transactionRepository;
  }

  public async Task<Result<bool>> Handle(DeleteTransactionCommand command, CancellationToken cancellationToken)
  {
    var transaction = await _transactionRepository.GetByIdAsync(command.Id);
    if (transaction is null)
      return Result<bool>.Failure(new DomainError("Transaction.NotFound", "Transaction not found."));

    await _transactionRepository.DeleteAsync(transaction);
    return Result<bool>.Success(true);
  }
}
