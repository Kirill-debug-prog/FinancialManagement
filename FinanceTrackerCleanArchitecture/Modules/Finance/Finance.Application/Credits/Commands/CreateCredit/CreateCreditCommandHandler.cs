using MediatR;
using Core.Domain.Common;
using Finance.Domain.Entities;
using Finance.Domain.Interfaces;

namespace Finance.Application.Credits.Commands.CreateCredit;

public class CreateCreditCommandHandler : IRequestHandler<CreateCreditCommand, Result<Guid>>
{
  private readonly ICreditRepository _creditRepository;
  private readonly IProfileChecker _profileChecker;
  private readonly ICurrencyRepository _currencyRepository;

  public CreateCreditCommandHandler(ICreditRepository creditRepository, IProfileChecker profileChecker, ICurrencyRepository currencyRepository)
  {
    _creditRepository = creditRepository;
    _profileChecker = profileChecker;
    _currencyRepository = currencyRepository;
  }

  public async Task<Result<Guid>> Handle(CreateCreditCommand command, CancellationToken cancellationToken)
  {
    if (!await _profileChecker.ExistsAsync(command.ProfileId))
      return Result<Guid>.Failure(new DomainError("Credit.ProfileNotFound", "Profile not found."));

    var currency = await _currencyRepository.GetByIdAsync(command.CurrencyId);
    if (currency is null)
      return Result<Guid>.Failure(new DomainError("Credit.CurrencyNotFound", "Currency not found."));

    var (profileId, currencyId, name, totalAmount, monthlyPayment, interestRate, startDate, endDate) = command;
    var credit = Credit.Create(profileId, currencyId, name, totalAmount, monthlyPayment, interestRate, startDate, endDate);

    if (credit.IsFailure)
      return Result<Guid>.Failure(credit.Error!);

    await _creditRepository.CreateAsync(credit.Value!);
    return Result<Guid>.Success(credit.Value!.Id);
  }
}
