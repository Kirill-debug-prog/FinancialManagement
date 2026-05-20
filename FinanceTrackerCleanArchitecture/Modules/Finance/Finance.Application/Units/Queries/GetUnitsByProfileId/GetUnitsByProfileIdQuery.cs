using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Units.Queries.GetUnitsByProfileId;

public record GetUnitsByProfileIdQuery(Guid ProfileId) : IRequest<Result<IEnumerable<GetUnitsByProfileIdResponse>>>;
