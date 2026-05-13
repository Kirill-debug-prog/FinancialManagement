using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Debts.Commands.RepayDebt;

public class RepayDebtCommandHandler
{
  private readonly IDebtRepository _debtRepository;

  public RepayDebtCommandHandler(IDebtRepository debtRepository)
  {
    _debtRepository = debtRepository;
  }

  public async Task<Result<bool>> Handle(RepayDebtCommand command)
  {
    var debt = await _debtRepository.GetByIdAsync(command.Id);
    if (debt is null)
      return Result<bool>.Failure(new DomainError("Debt.NotFound", "Debt not found."));

    if (debt.IsRepaid)
      return Result<bool>.Failure(new DomainError("Debt.AlreadyRepaid", "Debt is already repaid."));

    debt.Repay();
    await _debtRepository.UpdateAsync(debt);
    return Result<bool>.Success(true);
  }
}
