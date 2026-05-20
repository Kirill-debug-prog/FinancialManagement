using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Transactions.Queries.GetTransactionById;

public record GetTransactionByIdQuery(Guid Id) : IRequest<Result<GetTransactionByIdResponse>>;
