using Core.Domain.Common;
using Core.Domain.Entities;

namespace Finance.Domain.Entities;

public class Credit : BaseEntity
{
  public Guid ProfileId { get; private set; }
  public Guid CurrencyId { get; private set; }
  public Currency Currency { get; private set; } = null!;
  public string Name { get; private set; } = string.Empty;
  public decimal TotalAmount { get; private set; }
  public decimal RemainingAmount { get; private set; }
  public decimal MonthlyPayment { get; private set; }
  public decimal InterestRate { get; private set; }
  public DateOnly StartDate { get; private set; }
  public DateOnly EndDate { get; private set; }
  public bool IsClosed { get; private set; } = false;

  private Credit() : base() { }

  private Credit(Guid id, Guid profileId, Guid currencyId, string name, decimal totalAmount,
    decimal monthlyPayment, decimal interestRate, DateOnly startDate, DateOnly endDate) : base(id)
  {
    ProfileId = profileId;
    CurrencyId = currencyId;
    Name = name;
    TotalAmount = totalAmount;
    RemainingAmount = totalAmount;
    MonthlyPayment = monthlyPayment;
    InterestRate = interestRate;
    StartDate = startDate;
    EndDate = endDate;
  }

  public static Result<Credit> Create(Guid profileId, Guid currencyId, string name, decimal totalAmount,
    decimal monthlyPayment, decimal interestRate, DateOnly startDate, DateOnly endDate)
  {
    if (profileId == Guid.Empty)
      return Result<Credit>.Failure(new DomainError("Credit.InvalidProfileId", "ProfileId is required."));

    if (currencyId == Guid.Empty)
      return Result<Credit>.Failure(new DomainError("Credit.InvalidCurrencyId", "CurrencyId is required."));

    if (string.IsNullOrWhiteSpace(name))
      return Result<Credit>.Failure(new DomainError("Credit.InvalidName", "Name is required."));

    if (name.Length > 256)
      return Result<Credit>.Failure(new DomainError("Credit.InvalidName", "Name must be 256 characters or less."));

    if (totalAmount <= 0)
      return Result<Credit>.Failure(new DomainError("Credit.InvalidTotalAmount", "Total amount must be greater than 0."));

    if (monthlyPayment <= 0)
      return Result<Credit>.Failure(new DomainError("Credit.InvalidMonthlyPayment", "Monthly payment must be greater than 0."));

    if (interestRate < 0)
      return Result<Credit>.Failure(new DomainError("Credit.InvalidInterestRate", "Interest rate cannot be negative."));

    if (endDate <= startDate)
      return Result<Credit>.Failure(new DomainError("Credit.InvalidDates", "End date must be after start date."));

    return Result<Credit>.Success(new Credit(Guid.NewGuid(), profileId, currencyId, name,
      totalAmount, monthlyPayment, interestRate, startDate, endDate));
  }

  public Result<bool> MakePayment(decimal amount)
  {
    if (IsClosed)
      return Result<bool>.Failure(new DomainError("Credit.AlreadyClosed", "Credit is already closed."));

    if (amount <= 0)
      return Result<bool>.Failure(new DomainError("Credit.InvalidPaymentAmount", "Payment amount must be greater than 0."));

    if (amount > RemainingAmount)
      return Result<bool>.Failure(new DomainError("Credit.PaymentExceedsRemaining", "Payment amount exceeds remaining debt."));

    RemainingAmount -= amount;

    if (RemainingAmount == 0)
      IsClosed = true;

    SetUpdated();
    return Result<bool>.Success(true);
  }

  public Result<bool> Rename(string newName)
  {
    if (string.IsNullOrWhiteSpace(newName))
      return Result<bool>.Failure(new DomainError("Credit.InvalidName", "Name is required."));

    if (newName.Length > 256)
      return Result<bool>.Failure(new DomainError("Credit.InvalidName", "Name must be 256 characters or less."));

    Name = newName;
    SetUpdated();
    return Result<bool>.Success(true);
  }

  public void Close()
  {
    IsClosed = true;
    RemainingAmount = 0;
    SetUpdated();
  }
}
