using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Deposits.Commands.RenameDeposit;

public class RenameDepositCommandHandler : IRequestHandler<RenameDepositCommand, Result<bool>>
{
  private readonly IDepositRepository _depositRepository;

  public RenameDepositCommandHandler(IDepositRepository depositRepository)
  {
    _depositRepository = depositRepository;
  }

  public async Task<Result<bool>> Handle(RenameDepositCommand command, CancellationToken cancellationToken)
  {
    var deposit = await _depositRepository.GetByIdAsync(command.Id);
    if (deposit is null)
      return Result<bool>.Failure(new DomainError("Deposit.NotFound", "Deposit not found."));

    var result = deposit.Rename(command.NewName);
    if (result.IsFailure)
      return result;

    await _depositRepository.UpdateAsync(deposit);
    return Result<bool>.Success(true);
  }
}
