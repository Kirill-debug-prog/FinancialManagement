using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Wallets.Commands.DeleteWallet;

public class DeleteWalletCommandHandler
{
  private readonly IWalletRepository _walletRepository;

  public DeleteWalletCommandHandler(IWalletRepository walletRepository)
  {
    _walletRepository = walletRepository;
  }

  public async Task<Result<bool>> Handle(DeleteWalletCommand command)
  {
    var wallet = await _walletRepository.GetWalletByIdAsync(command.Id);
    if (wallet is null)
      return Result<bool>.Failure(new DomainError("Wallet.NotFound", "Wallet not found."));

    await _walletRepository.DeleteAsync(command.Id);
    return Result<bool>.Success(true);
  }
}
