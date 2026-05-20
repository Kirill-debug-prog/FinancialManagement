using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Debts.Commands.DeleteDebt;

public record DeleteDebtCommand(Guid Id) : IRequest<Result<bool>>;
