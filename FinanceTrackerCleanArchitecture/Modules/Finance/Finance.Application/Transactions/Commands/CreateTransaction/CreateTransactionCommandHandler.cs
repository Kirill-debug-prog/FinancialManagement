using MediatR;
using Core.Domain.Common;
using Finance.Domain.Entities;
using Finance.Domain.Interfaces;

namespace Finance.Application.Transactions.Commands.CreateTransaction;

public class CreateTransactionCommandHandler : IRequestHandler<CreateTransactionCommand, Result<Guid>>
{
  private readonly ITransactionRepository _transactionRepository;
  private readonly IWalletRepository _walletRepository;

  public CreateTransactionCommandHandler(ITransactionRepository transactionRepository, IWalletRepository walletRepository)
  {
    _transactionRepository = transactionRepository;
    _walletRepository = walletRepository;
  }

  public async Task<Result<Guid>> Handle(CreateTransactionCommand command, CancellationToken cancellationToken)
  {
    var wallet = await _walletRepository.GetWalletByIdAsync(command.WalletId);
    if (wallet is null)
      return Result<Guid>.Failure(new DomainError("Transaction.WalletNotFound", "Wallet not found."));

    if (command.ToWalletId.HasValue)
    {
      var toWallet = await _walletRepository.GetWalletByIdAsync(command.ToWalletId.Value);
      if (toWallet is null)
        return Result<Guid>.Failure(new DomainError("Transaction.DestinationWalletNotFound", "Destination wallet not found."));
    }

    var (walletId, type, amount, date, categoryId, description, toWalletId) = command;
    var transaction = Transaction.Create(walletId, type, amount, date, categoryId, description, toWalletId);

    if (transaction.IsFailure)
      return Result<Guid>.Failure(transaction.Error!);

    await _transactionRepository.CreateAsync(transaction.Value!);
    return Result<Guid>.Success(transaction.Value!.Id);
  }
}
