using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Wallets.Commands.ChangeSortOrder;

public class ChangeSortOrderCommandHandler
{
  private readonly IWalletRepository _walletRepository;

  public ChangeSortOrderCommandHandler(IWalletRepository walletRepository)
  {
    _walletRepository = walletRepository;
  }

  public async Task<Result<bool>> Handle(ChangeSortOrderCommand command)
  {
    var wallet = await _walletRepository.GetWalletByIdAsync(command.Id);
    if (wallet is null)
      return Result<bool>.Failure(new DomainError("Wallet.NotFound", "Wallet not found."));

    var result = wallet.ChangeSortOrder(command.NewSortOrder);
    if (result.IsFailure)
      return Result<bool>.Failure(result.Error!);

    await _walletRepository.UpdateAsync(wallet);
    return Result<bool>.Success(true);
  }
}
