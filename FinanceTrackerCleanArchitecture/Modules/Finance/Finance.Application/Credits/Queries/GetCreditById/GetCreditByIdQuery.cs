using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Credits.Queries.GetCreditById;

public record GetCreditByIdQuery(Guid Id) : IRequest<Result<GetCreditByIdResponse>>;
