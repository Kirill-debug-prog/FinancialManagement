using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Currencies.Queries.GetAllCurrencies;

public record GetAllCurrenciesQuery : IRequest<Result<IEnumerable<GetAllCurrenciesResponse>>>;
