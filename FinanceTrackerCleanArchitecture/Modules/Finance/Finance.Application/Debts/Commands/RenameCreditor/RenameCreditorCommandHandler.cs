using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Debts.Commands.RenameCreditor;

public class RenameCreditorCommandHandler : IRequestHandler<RenameCreditorCommand, Result<bool>>
{
  private readonly IDebtRepository _debtRepository;

  public RenameCreditorCommandHandler(IDebtRepository debtRepository)
  {
    _debtRepository = debtRepository;
  }

  public async Task<Result<bool>> Handle(RenameCreditorCommand command, CancellationToken cancellationToken)
  {
    var debt = await _debtRepository.GetByIdAsync(command.Id);
    if (debt is null)
      return Result<bool>.Failure(new DomainError("Debt.NotFound", "Debt not found."));

    var result = debt.RenameCreditor(command.NewCreditorName);
    if (result.IsFailure)
      return result;

    await _debtRepository.UpdateAsync(debt);
    return Result<bool>.Success(true);
  }
}
