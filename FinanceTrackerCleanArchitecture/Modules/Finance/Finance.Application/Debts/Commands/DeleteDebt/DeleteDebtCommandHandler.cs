using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Debts.Commands.DeleteDebt;

public class DeleteDebtCommandHandler : IRequestHandler<DeleteDebtCommand, Result<bool>>
{
  private readonly IDebtRepository _debtRepository;

  public DeleteDebtCommandHandler(IDebtRepository debtRepository)
  {
    _debtRepository = debtRepository;
  }

  public async Task<Result<bool>> Handle(DeleteDebtCommand command, CancellationToken cancellationToken)
  {
    var debt = await _debtRepository.GetByIdAsync(command.Id);
    if (debt is null)
      return Result<bool>.Failure(new DomainError("Debt.NotFound", "Debt not found."));

    await _debtRepository.DeleteAsync(debt);
    return Result<bool>.Success(true);
  }
}
