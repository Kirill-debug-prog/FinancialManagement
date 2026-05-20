using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Debts.Commands.RepayDebt;

public record RepayDebtCommand(Guid Id) : IRequest<Result<bool>>;
