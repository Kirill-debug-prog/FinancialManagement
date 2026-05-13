using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Debts.Commands.ChangeDueDate;

public class ChangeDueDateCommandHandler
{
  private readonly IDebtRepository _debtRepository;

  public ChangeDueDateCommandHandler(IDebtRepository debtRepository)
  {
    _debtRepository = debtRepository;
  }

  public async Task<Result<bool>> Handle(ChangeDueDateCommand command)
  {
    var debt = await _debtRepository.GetByIdAsync(command.Id);
    if (debt is null)
      return Result<bool>.Failure(new DomainError("Debt.NotFound", "Debt not found."));

    debt.ChangeDueDate(command.NewDueDate);
    await _debtRepository.UpdateAsync(debt);
    return Result<bool>.Success(true);
  }
}
