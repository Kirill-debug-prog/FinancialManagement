using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Debts.Commands.MakePayment;

public class MakeDebtPaymentCommandHandler
{
  private readonly IDebtRepository _debtRepository;

  public MakeDebtPaymentCommandHandler(IDebtRepository debtRepository)
  {
    _debtRepository = debtRepository;
  }

  public async Task<Result<bool>> Handle(MakeDebtPaymentCommand command)
  {
    var debt = await _debtRepository.GetByIdAsync(command.DebtId);
    if (debt is null)
      return Result<bool>.Failure(new DomainError("Debt.NotFound", "Debt not found."));

    var result = debt.MakePayment(command.Amount);
    if (result.IsFailure)
      return result;

    await _debtRepository.UpdateAsync(debt);
    return Result<bool>.Success(true);
  }
}
