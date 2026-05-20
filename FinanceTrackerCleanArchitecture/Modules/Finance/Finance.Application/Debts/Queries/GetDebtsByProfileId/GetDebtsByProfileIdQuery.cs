using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Debts.Queries.GetDebtsByProfileId;

public record GetDebtsByProfileIdQuery(Guid ProfileId) : IRequest<Result<IEnumerable<GetDebtsByProfileIdResponse>>>;
