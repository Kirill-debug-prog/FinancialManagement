using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.RecurringTransactions.Commands.DeactivateRecurringTransaction;

public class DeactivateRecurringTransactionCommandHandler : IRequestHandler<DeactivateRecurringTransactionCommand, Result<bool>>
{
  private readonly IRecurringTransactionRepository _recurringTransactionRepository;

  public DeactivateRecurringTransactionCommandHandler(IRecurringTransactionRepository recurringTransactionRepository)
  {
    _recurringTransactionRepository = recurringTransactionRepository;
  }

  public async Task<Result<bool>> Handle(DeactivateRecurringTransactionCommand command, CancellationToken cancellationToken)
  {
    var recurringTransaction = await _recurringTransactionRepository.GetByIdAsync(command.Id);
    if (recurringTransaction is null)
      return Result<bool>.Failure(new DomainError("RecurringTransaction.NotFound", "Recurring transaction not found."));

    if (!recurringTransaction.IsActive)
      return Result<bool>.Failure(new DomainError("RecurringTransaction.AlreadyInactive", "Recurring transaction is already inactive."));

    recurringTransaction.Deactivate();
    await _recurringTransactionRepository.UpdateAsync(recurringTransaction);
    return Result<bool>.Success(true);
  }
}
