using MediatR;
using Core.Domain.Common;
using Finance.Domain.Enums;

namespace Finance.Application.Transactions.Commands.CreateTransaction;

public record CreateTransactionCommand(
  Guid WalletId,
  FinancialType Type,
  decimal Amount,
  DateOnly Date,
  Guid? CategoryId = null,
  string? Description = null,
  Guid? ToWalletId = null) : IRequest<Result<Guid>>;
