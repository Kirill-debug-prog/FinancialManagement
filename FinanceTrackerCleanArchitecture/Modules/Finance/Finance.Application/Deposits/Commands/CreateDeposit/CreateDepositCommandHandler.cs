using Core.Domain.Common;
using Finance.Domain.Entities;
using Finance.Domain.Interfaces;

namespace Finance.Application.Deposits.Commands.CreateDeposit;

public class CreateDepositCommandHandler
{
  private readonly IDepositRepository _depositRepository;
  private readonly IProfileChecker _profileChecker;
  private readonly ICurrencyRepository _currencyRepository;

  public CreateDepositCommandHandler(IDepositRepository depositRepository, IProfileChecker profileChecker, ICurrencyRepository currencyRepository)
  {
    _depositRepository = depositRepository;
    _profileChecker = profileChecker;
    _currencyRepository = currencyRepository;
  }

  public async Task<Result<Guid>> Handle(CreateDepositCommand command)
  {
    if (!await _profileChecker.ExistsAsync(command.ProfileId))
      return Result<Guid>.Failure(new DomainError("Deposit.ProfileNotFound", "Profile not found."));

    var currency = await _currencyRepository.GetByIdAsync(command.CurrencyId);
    if (currency is null)
      return Result<Guid>.Failure(new DomainError("Deposit.CurrencyNotFound", "Currency not found."));

    var (profileId, currencyId, name, initialAmount, interestRate, startDate, endDate, isCapitalized, type) = command;
    var deposit = Deposit.Create(profileId, currencyId, name, initialAmount, interestRate, startDate, endDate, isCapitalized, type);

    if (deposit.IsFailure)
      return Result<Guid>.Failure(deposit.Error!);

    await _depositRepository.CreateAsync(deposit.Value!);
    return Result<Guid>.Success(deposit.Value!.Id);
  }
}
