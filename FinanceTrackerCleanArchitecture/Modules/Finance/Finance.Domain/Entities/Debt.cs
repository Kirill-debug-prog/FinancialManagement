using Core.Domain.Common;
using Core.Domain.Entities;

namespace Finance.Domain.Entities;

public class Debt : BaseEntity
{
  public Guid ProfileId { get; private set; }
  public Guid CurrencyId { get; private set; }
  public Currency Currency { get; private set; } = null!;
  public string CreditorName { get; private set; } = string.Empty;
  public decimal TotalAmount { get; private set; }
  public decimal RemainingAmount { get; private set; }
  public DateOnly? DueDate { get; private set; }
  public bool IsRepaid { get; private set; } = false;

  private Debt() : base() { }

  private Debt(Guid id, Guid profileId, Guid currencyId, string creditorName, decimal totalAmount, DateOnly? dueDate) : base(id)
  {
    ProfileId = profileId;
    CurrencyId = currencyId;
    CreditorName = creditorName;
    TotalAmount = totalAmount;
    RemainingAmount = totalAmount;
    DueDate = dueDate;
  }

  public static Result<Debt> Create(Guid profileId, Guid currencyId, string creditorName, decimal totalAmount, DateOnly? dueDate = null)
  {
    if (profileId == Guid.Empty)
      return Result<Debt>.Failure(new DomainError("Debt.InvalidProfileId", "ProfileId is required."));

    if (currencyId == Guid.Empty)
      return Result<Debt>.Failure(new DomainError("Debt.InvalidCurrencyId", "CurrencyId is required."));

    if (string.IsNullOrWhiteSpace(creditorName))
      return Result<Debt>.Failure(new DomainError("Debt.InvalidCreditorName", "Creditor name is required."));

    if (creditorName.Length > 256)
      return Result<Debt>.Failure(new DomainError("Debt.InvalidCreditorName", "Creditor name must be 256 characters or less."));

    if (totalAmount <= 0)
      return Result<Debt>.Failure(new DomainError("Debt.InvalidTotalAmount", "Total amount must be greater than 0."));

    return Result<Debt>.Success(new Debt(Guid.NewGuid(), profileId, currencyId, creditorName, totalAmount, dueDate));
  }

  public Result<bool> MakePayment(decimal amount)
  {
    if (IsRepaid)
      return Result<bool>.Failure(new DomainError("Debt.AlreadyRepaid", "Debt is already repaid."));

    if (amount <= 0)
      return Result<bool>.Failure(new DomainError("Debt.InvalidPaymentAmount", "Payment amount must be greater than 0."));

    if (amount > RemainingAmount)
      return Result<bool>.Failure(new DomainError("Debt.PaymentExceedsRemaining", "Payment amount exceeds remaining debt."));

    RemainingAmount -= amount;

    if (RemainingAmount == 0)
      IsRepaid = true;

    SetUpdated();
    return Result<bool>.Success(true);
  }

  public Result<bool> RenameCreditor(string newCreditorName)
  {
    if (string.IsNullOrWhiteSpace(newCreditorName))
      return Result<bool>.Failure(new DomainError("Debt.InvalidCreditorName", "Creditor name is required."));

    if (newCreditorName.Length > 256)
      return Result<bool>.Failure(new DomainError("Debt.InvalidCreditorName", "Creditor name must be 256 characters or less."));

    CreditorName = newCreditorName;
    SetUpdated();
    return Result<bool>.Success(true);
  }

  public void ChangeDueDate(DateOnly? newDueDate)
  {
    DueDate = newDueDate;
    SetUpdated();
  }

  public void Repay()
  {
    IsRepaid = true;
    RemainingAmount = 0;
    SetUpdated();
  }
}
