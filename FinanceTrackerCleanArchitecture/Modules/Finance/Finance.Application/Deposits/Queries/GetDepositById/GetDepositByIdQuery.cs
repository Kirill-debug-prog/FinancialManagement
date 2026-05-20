using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Deposits.Queries.GetDepositById;

public record GetDepositByIdQuery(Guid Id) : IRequest<Result<GetDepositByIdResponse>>;
