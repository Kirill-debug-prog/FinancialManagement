using Core.Domain.Common;
using Core.Domain.Entities;
using Finance.Domain.Enums;

namespace Finance.Domain.Entities;

public class Deposit : BaseEntity
{
  public Guid ProfileId { get; private set; }
  public Guid CurrencyId { get; private set; }
  public Currency Currency { get; private set; } = null!;
  public string Name { get; private set; } = string.Empty;
  public decimal InitialAmount { get; private set; }
  public decimal CurrentAmount { get; private set; }
  public decimal InterestRate { get; private set; }
  public DateOnly StartDate { get; private set; }
  public DateOnly EndDate { get; private set; }
  public bool IsCapitalized { get; private set; }
  public bool IsClosed { get; private set; } = false;
  public DepositType Type { get; private set; }

  private Deposit() : base() { }

  private Deposit(Guid id, Guid profileId, Guid currencyId, string name, decimal initialAmount,
    decimal interestRate, DateOnly startDate, DateOnly endDate, bool isCapitalized, DepositType type) : base(id)
  {
    ProfileId = profileId;
    CurrencyId = currencyId;
    Name = name;
    InitialAmount = initialAmount;
    CurrentAmount = initialAmount;
    InterestRate = interestRate;
    StartDate = startDate;
    EndDate = endDate;
    IsCapitalized = isCapitalized;
    Type = type;
  }

  public static Result<Deposit> Create(Guid profileId, Guid currencyId, string name, decimal initialAmount,
    decimal interestRate, DateOnly startDate, DateOnly endDate, bool isCapitalized, DepositType type)
  {
    if (profileId == Guid.Empty)
      return Result<Deposit>.Failure(new DomainError("Deposit.InvalidProfileId", "ProfileId is required."));

    if (currencyId == Guid.Empty)
      return Result<Deposit>.Failure(new DomainError("Deposit.InvalidCurrencyId", "CurrencyId is required."));

    if (string.IsNullOrWhiteSpace(name))
      return Result<Deposit>.Failure(new DomainError("Deposit.InvalidName", "Name is required."));

    if (name.Length > 256)
      return Result<Deposit>.Failure(new DomainError("Deposit.InvalidName", "Name must be 256 characters or less."));

    if (initialAmount <= 0)
      return Result<Deposit>.Failure(new DomainError("Deposit.InvalidInitialAmount", "Initial amount must be greater than 0."));

    if (interestRate <= 0)
      return Result<Deposit>.Failure(new DomainError("Deposit.InvalidInterestRate", "Interest rate must be greater than 0."));

    if (endDate <= startDate)
      return Result<Deposit>.Failure(new DomainError("Deposit.InvalidDates", "End date must be after start date."));

    return Result<Deposit>.Success(new Deposit(Guid.NewGuid(), profileId, currencyId, name,
      initialAmount, interestRate, startDate, endDate, isCapitalized, type));
  }

  public Result<bool> TopUp(decimal amount)
  {
    if (IsClosed)
      return Result<bool>.Failure(new DomainError("Deposit.AlreadyClosed", "Deposit is already closed."));

    if (amount <= 0)
      return Result<bool>.Failure(new DomainError("Deposit.InvalidTopUpAmount", "Top-up amount must be greater than 0."));

    CurrentAmount += amount;
    SetUpdated();
    return Result<bool>.Success(true);
  }

  public Result<bool> Rename(string newName)
  {
    if (string.IsNullOrWhiteSpace(newName))
      return Result<bool>.Failure(new DomainError("Deposit.InvalidName", "Name is required."));

    if (newName.Length > 256)
      return Result<bool>.Failure(new DomainError("Deposit.InvalidName", "Name must be 256 characters or less."));

    Name = newName;
    SetUpdated();
    return Result<bool>.Success(true);
  }

  public Result<bool> Close()
  {
    if (IsClosed)
      return Result<bool>.Failure(new DomainError("Deposit.AlreadyClosed", "Deposit is already closed."));

    IsClosed = true;
    SetUpdated();
    return Result<bool>.Success(true);
  }
}
