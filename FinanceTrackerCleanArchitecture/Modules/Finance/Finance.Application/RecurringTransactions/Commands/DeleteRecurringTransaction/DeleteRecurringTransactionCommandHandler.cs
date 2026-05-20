using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.RecurringTransactions.Commands.DeleteRecurringTransaction;

public class DeleteRecurringTransactionCommandHandler : IRequestHandler<DeleteRecurringTransactionCommand, Result<bool>>
{
  private readonly IRecurringTransactionRepository _recurringTransactionRepository;

  public DeleteRecurringTransactionCommandHandler(IRecurringTransactionRepository recurringTransactionRepository)
  {
    _recurringTransactionRepository = recurringTransactionRepository;
  }

  public async Task<Result<bool>> Handle(DeleteRecurringTransactionCommand command, CancellationToken cancellationToken)
  {
    var recurringTransaction = await _recurringTransactionRepository.GetByIdAsync(command.Id);
    if (recurringTransaction is null)
      return Result<bool>.Failure(new DomainError("RecurringTransaction.NotFound", "Recurring transaction not found."));

    await _recurringTransactionRepository.DeleteAsync(recurringTransaction);
    return Result<bool>.Success(true);
  }
}
