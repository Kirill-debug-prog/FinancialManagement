using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Debts.Commands.CreateDebt;

public record CreateDebtCommand(
  Guid ProfileId,
  Guid CurrencyId,
  string CreditorName,
  decimal TotalAmount,
  DateOnly? DueDate = null) : IRequest<Result<Guid>>;
