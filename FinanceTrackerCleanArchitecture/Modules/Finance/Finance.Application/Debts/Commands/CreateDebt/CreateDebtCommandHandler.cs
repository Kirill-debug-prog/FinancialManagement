using MediatR;
using Core.Domain.Common;
using Finance.Domain.Entities;
using Finance.Domain.Interfaces;

namespace Finance.Application.Debts.Commands.CreateDebt;

public class CreateDebtCommandHandler : IRequestHandler<CreateDebtCommand, Result<Guid>>
{
  private readonly IDebtRepository _debtRepository;
  private readonly IProfileChecker _profileChecker;
  private readonly ICurrencyRepository _currencyRepository;

  public CreateDebtCommandHandler(IDebtRepository debtRepository, IProfileChecker profileChecker, ICurrencyRepository currencyRepository)
  {
    _debtRepository = debtRepository;
    _profileChecker = profileChecker;
    _currencyRepository = currencyRepository;
  }

  public async Task<Result<Guid>> Handle(CreateDebtCommand command, CancellationToken cancellationToken)
  {
    if (!await _profileChecker.ExistsAsync(command.ProfileId))
      return Result<Guid>.Failure(new DomainError("Debt.ProfileNotFound", "Profile not found."));

    var currency = await _currencyRepository.GetByIdAsync(command.CurrencyId);
    if (currency is null)
      return Result<Guid>.Failure(new DomainError("Debt.CurrencyNotFound", "Currency not found."));

    var (profileId, currencyId, creditorName, totalAmount, dueDate) = command;
    var debt = Debt.Create(profileId, currencyId, creditorName, totalAmount, dueDate);

    if (debt.IsFailure)
      return Result<Guid>.Failure(debt.Error!);

    await _debtRepository.CreateAsync(debt.Value!);
    return Result<Guid>.Success(debt.Value!.Id);
  }
}
