using MediatR;
using Core.Domain.Common;
namespace Finance.Application.RecurringTransactions.Commands.DeactivateRecurringTransaction;

public record DeactivateRecurringTransactionCommand(Guid Id) : IRequest<Result<bool>>;
