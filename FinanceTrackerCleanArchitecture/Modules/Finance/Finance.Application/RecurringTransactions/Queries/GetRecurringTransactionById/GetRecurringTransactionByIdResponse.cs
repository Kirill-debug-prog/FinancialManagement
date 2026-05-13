using Finance.Domain.Enums;

namespace Finance.Application.RecurringTransactions.Queries.GetRecurringTransactionById;

public record GetRecurringTransactionByIdResponse(
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
