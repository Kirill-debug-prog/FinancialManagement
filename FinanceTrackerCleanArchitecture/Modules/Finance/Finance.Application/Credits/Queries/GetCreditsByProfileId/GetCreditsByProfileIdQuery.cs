using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Credits.Queries.GetCreditsByProfileId;

public record GetCreditsByProfileIdQuery(Guid ProfileId) : IRequest<Result<IEnumerable<GetCreditsByProfileIdResponse>>>;
