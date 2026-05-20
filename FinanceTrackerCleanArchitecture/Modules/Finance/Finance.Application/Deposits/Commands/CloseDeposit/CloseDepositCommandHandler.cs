using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Deposits.Commands.CloseDeposit;

public class CloseDepositCommandHandler : IRequestHandler<CloseDepositCommand, Result<bool>>
{
  private readonly IDepositRepository _depositRepository;

  public CloseDepositCommandHandler(IDepositRepository depositRepository)
  {
    _depositRepository = depositRepository;
  }

  public async Task<Result<bool>> Handle(CloseDepositCommand command, CancellationToken cancellationToken)
  {
    var deposit = await _depositRepository.GetByIdAsync(command.Id);
    if (deposit is null)
      return Result<bool>.Failure(new DomainError("Deposit.NotFound", "Deposit not found."));

    var result = deposit.Close();
    if (result.IsFailure)
      return result;

    await _depositRepository.UpdateAsync(deposit);
    return Result<bool>.Success(true);
  }
}
