using Finance.Domain.Enums;

namespace Finance.Application.Transactions.Queries.GetTransactionsByWalletId;

public record GetTransactionsByWalletIdResponse(
  Guid Id,
  Guid WalletId,
  Guid? CategoryId,
  string? CategoryName,
  FinancialType Type,
  decimal Amount,
  DateOnly Date,
  string? Description);
