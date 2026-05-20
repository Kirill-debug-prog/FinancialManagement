using MediatR;
using Core.Domain.Common;
namespace Finance.Application.RecurringTransactions.Queries.GetRecurringTransactionById;

public record GetRecurringTransactionByIdQuery(Guid Id) : IRequest<Result<GetRecurringTransactionByIdResponse>>;
