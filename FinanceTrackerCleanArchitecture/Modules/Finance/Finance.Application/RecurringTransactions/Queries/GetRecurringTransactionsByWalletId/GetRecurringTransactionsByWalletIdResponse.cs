using Finance.Domain.Enums;

namespace Finance.Application.RecurringTransactions.Queries.GetRecurringTransactionsByWalletId;

public record GetRecurringTransactionsByWalletIdResponse(
  Guid Id,
  Guid WalletId,
  Guid? ToWalletId,
  Guid? CategoryId,
  FinancialType Type,
  decimal Amount,
  string? Description,
  RecurrenceInterval Interval,
  DateOnly StartDate,
  DateOnly? EndDate,
  DateOnly NextOccurrenceDate,
  bool IsActive);
