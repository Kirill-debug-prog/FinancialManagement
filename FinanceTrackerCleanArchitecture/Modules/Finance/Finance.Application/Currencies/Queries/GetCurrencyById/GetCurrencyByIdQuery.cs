using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Currencies.Queries.GetCurrencyById;

public record GetCurrencyByIdQuery(Guid Id) : IRequest<Result<GetCurrencyByIdResponse>>;
