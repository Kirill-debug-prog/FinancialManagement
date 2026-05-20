using MediatR;
using Core.Domain.Common;
using Finance.Domain.Entities;
using Finance.Domain.Interfaces;

namespace Finance.Application.RecurringTransactions.Commands.CreateRecurringTransaction;

public class CreateRecurringTransactionCommandHandler : IRequestHandler<CreateRecurringTransactionCommand, Result<Guid>>
{
  private readonly IRecurringTransactionRepository _recurringTransactionRepository;
  private readonly IWalletRepository _walletRepository;

  public CreateRecurringTransactionCommandHandler(IRecurringTransactionRepository recurringTransactionRepository, IWalletRepository walletRepository)
  {
    _recurringTransactionRepository = recurringTransactionRepository;
    _walletRepository = walletRepository;
  }

  public async Task<Result<Guid>> Handle(CreateRecurringTransactionCommand command, CancellationToken cancellationToken)
  {
    var wallet = await _walletRepository.GetWalletByIdAsync(command.WalletId);
    if (wallet is null)
      return Result<Guid>.Failure(new DomainError("RecurringTransaction.WalletNotFound", "Wallet not found."));

    if (command.ToWalletId.HasValue)
    {
      var toWallet = await _walletRepository.GetWalletByIdAsync(command.ToWalletId.Value);
      if (toWallet is null)
        return Result<Guid>.Failure(new DomainError("RecurringTransaction.DestinationWalletNotFound", "Destination wallet not found."));
    }

    var (walletId, type, amount, interval, startDate, categoryId, description, toWalletId, endDate) = command;
    var recurringTransaction = RecurringTransaction.Create(walletId, type, amount, interval, startDate, categoryId, description, toWalletId, endDate);

    if (recurringTransaction.IsFailure)
      return Result<Guid>.Failure(recurringTransaction.Error!);

    await _recurringTransactionRepository.CreateAsync(recurringTransaction.Value!);
    return Result<Guid>.Success(recurringTransaction.Value!.Id);
  }
}
