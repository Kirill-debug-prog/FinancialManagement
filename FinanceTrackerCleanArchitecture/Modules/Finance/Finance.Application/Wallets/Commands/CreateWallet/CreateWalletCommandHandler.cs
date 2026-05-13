using Core.Domain.Common;
using Finance.Domain.Entities;
using Finance.Domain.Interfaces;

namespace Finance.Application.Wallets.Commands.CreateWallet;

public class CreateWalletCommandHandler
{
  private readonly IWalletRepository _walletRepository;
  private readonly IProfileChecker _profileChecker;
  private readonly ICurrencyRepository _currencyRepository;

  public CreateWalletCommandHandler(IWalletRepository walletRepository, IProfileChecker profileChecker, ICurrencyRepository currencyRepository)
  {
    _walletRepository = walletRepository;
    _profileChecker = profileChecker;
    _currencyRepository = currencyRepository;
  }

  public async Task<Result<Guid>> Handle(CreateWalletCommand command)
  {
    if (!await _profileChecker.ExistsAsync(command.ProfileId))
      return Result<Guid>.Failure(new DomainError("Wallet.ProfileNotFound", "Profile not found."));

    var currency = await _currencyRepository.GetByIdAsync(command.CurrencyId);
    if (currency is null)
      return Result<Guid>.Failure(new DomainError("Wallet.CurrencyNotFound", "Currency not found."));

    var wallet = Wallet.Create(
      command.ProfileId,
      command.Name,
      command.SortOrder,
      command.CurrencyId,
      command.InitialBalance,
      command.Icon,
      command.Note);

    if (wallet.IsFailure)
      return Result<Guid>.Failure(wallet.Error!);

    await _walletRepository.CreateAsync(wallet.Value!);
    return Result<Guid>.Success(wallet.Value!.Id);
  }
}
