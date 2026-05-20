using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Deposits.Commands.TopUpDeposit;

public class TopUpDepositCommandHandler : IRequestHandler<TopUpDepositCommand, Result<bool>>
{
  private readonly IDepositRepository _depositRepository;

  public TopUpDepositCommandHandler(IDepositRepository depositRepository)
  {
    _depositRepository = depositRepository;
  }

  public async Task<Result<bool>> Handle(TopUpDepositCommand command, CancellationToken cancellationToken)
  {
    var deposit = await _depositRepository.GetByIdAsync(command.DepositId);
    if (deposit is null)
      return Result<bool>.Failure(new DomainError("Deposit.NotFound", "Deposit not found."));

    var result = deposit.TopUp(command.Amount);
    if (result.IsFailure)
      return result;

    await _depositRepository.UpdateAsync(deposit);
    return Result<bool>.Success(true);
  }
}
