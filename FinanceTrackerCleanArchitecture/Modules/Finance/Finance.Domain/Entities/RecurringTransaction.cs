using Finance.Domain.Enums;
using Core.Domain.Entities;
using Core.Domain.Common;

namespace Finance.Domain.Entities;

public class RecurringTransaction : BaseEntity
{
  public Guid WalletId { get; private set; }
  public Wallet Wallet { get; private set; } = null!;
  public Guid? ToWalletId { get; private set; }
  public Wallet? ToWallet { get; private set; }
  public Guid? CategoryId { get; private set; }
  public Category? Category { get; private set; }
  public FinancialType Type { get; private set; }
  public decimal Amount { get; private set; }
  public string? Description { get; private set; }
  public RecurrenceInterval Interval { get; private set; }
  public DateOnly StartDate { get; private set; }
  public DateOnly? EndDate { get; private set; }
  public DateOnly NextOccurrenceDate { get; private set; }
  public bool IsActive { get; private set; } = true;

  private RecurringTransaction() : base() { }

  private RecurringTransaction(Guid id, Guid walletId, Guid? toWalletId, Guid? categoryId, FinancialType type,
    decimal amount, string? description, RecurrenceInterval interval, DateOnly startDate, DateOnly? endDate) : base(id)
  {
    WalletId = walletId;
    ToWalletId = toWalletId;
    CategoryId = categoryId;
    Type = type;
    Amount = amount;
    Description = description;
    Interval = interval;
    StartDate = startDate;
    EndDate = endDate;
    NextOccurrenceDate = startDate;
  }

  public static Result<RecurringTransaction> Create(Guid walletId, FinancialType type, decimal amount,
    RecurrenceInterval interval, DateOnly startDate, Guid? categoryId = null, string? description = null,
    Guid? toWalletId = null, DateOnly? endDate = null)
  {
    if (walletId == Guid.Empty)
      return Result<RecurringTransaction>.Failure(new DomainError("RecurringTransaction.InvalidWalletId", "WalletId is required."));

    if (amount <= 0)
      return Result<RecurringTransaction>.Failure(new DomainError("RecurringTransaction.InvalidAmount", "Amount must be greater than 0."));

    if (type == FinancialType.Transfer)
    {
      if (toWalletId is null || toWalletId == Guid.Empty)
        return Result<RecurringTransaction>.Failure(new DomainError("RecurringTransaction.TransferRequiresDestination", "Transfer requires a destination wallet."));

      if (toWalletId == walletId)
        return Result<RecurringTransaction>.Failure(new DomainError("RecurringTransaction.SameWalletTransfer", "Cannot transfer to the same wallet."));
    }

    if (endDate.HasValue && endDate <= startDate)
      return Result<RecurringTransaction>.Failure(new DomainError("RecurringTransaction.InvalidEndDate", "End date must be after start date."));

    if (description?.Length > 500)
      return Result<RecurringTransaction>.Failure(new DomainError("RecurringTransaction.InvalidDescription", "Description must be 500 characters or less."));

    return Result<RecurringTransaction>.Success(new RecurringTransaction(
      Guid.NewGuid(), walletId, toWalletId, categoryId, type, amount, description, interval, startDate, endDate));
  }

  public void AdvanceNextOccurrence()
  {
    NextOccurrenceDate = Interval switch
    {
      RecurrenceInterval.Daily => NextOccurrenceDate.AddDays(1),
      RecurrenceInterval.Weekly => NextOccurrenceDate.AddDays(7),
      RecurrenceInterval.Monthly => NextOccurrenceDate.AddMonths(1),
      RecurrenceInterval.Yearly => NextOccurrenceDate.AddYears(1),
      _ => NextOccurrenceDate
    };

    if (EndDate.HasValue && NextOccurrenceDate > EndDate)
      IsActive = false;

    SetUpdated();
  }

  public void Deactivate()
  {
    IsActive = false;
    SetUpdated();
  }
}
