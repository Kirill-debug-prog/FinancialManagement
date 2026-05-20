using MediatR;
using Core.Domain.Common;
namespace Finance.Application.RecurringTransactions.Commands.DeleteRecurringTransaction;

public record DeleteRecurringTransactionCommand(Guid Id) : IRequest<Result<bool>>;
