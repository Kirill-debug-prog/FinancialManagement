using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Deposits.Commands.DeleteDeposit;

public class DeleteDepositCommandHandler
{
  private readonly IDepositRepository _depositRepository;

  public DeleteDepositCommandHandler(IDepositRepository depositRepository)
  {
    _depositRepository = depositRepository;
  }

  public async Task<Result<bool>> Handle(DeleteDepositCommand command)
  {
    var deposit = await _depositRepository.GetByIdAsync(command.Id);
    if (deposit is null)
      return Result<bool>.Failure(new DomainError("Deposit.NotFound", "Deposit not found."));

    await _depositRepository.DeleteAsync(deposit);
    return Result<bool>.Success(true);
  }
}
