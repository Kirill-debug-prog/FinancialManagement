using Finance.Domain.Enums;

namespace Finance.Application.RecurringTransactions.Commands.CreateRecurringTransaction;

public record CreateRecurringTransactionCommand(
  Guid WalletId,
  FinancialType Type,
  decimal Amount,
  RecurrenceInterval Interval,
  DateOnly StartDate,
  Guid? CategoryId = null,
  string? Description = null,
  Guid? ToWalletId = null,
  DateOnly? EndDate = null);
