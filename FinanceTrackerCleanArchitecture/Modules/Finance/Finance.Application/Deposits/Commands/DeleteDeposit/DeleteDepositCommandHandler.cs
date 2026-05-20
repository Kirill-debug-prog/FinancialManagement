using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Deposits.Commands.DeleteDeposit;

public class DeleteDepositCommandHandler : IRequestHandler<DeleteDepositCommand, Result<bool>>
{
  private readonly IDepositRepository _depositRepository;

  public DeleteDepositCommandHandler(IDepositRepository depositRepository)
  {
    _depositRepository = depositRepository;
  }

  public async Task<Result<bool>> Handle(DeleteDepositCommand command, CancellationToken cancellationToken)
  {
    var deposit = await _depositRepository.GetByIdAsync(command.Id);
    if (deposit is null)
      return Result<bool>.Failure(new DomainError("Deposit.NotFound", "Deposit not found."));

    await _depositRepository.DeleteAsync(deposit);
    return Result<bool>.Success(true);
  }
}
