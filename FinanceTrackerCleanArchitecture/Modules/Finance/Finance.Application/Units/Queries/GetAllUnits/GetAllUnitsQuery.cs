using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Units.Queries.GetAllUnits;

public record GetAllUnitsQuery : IRequest<Result<IEnumerable<GetAllUnitsResponse>>>;
