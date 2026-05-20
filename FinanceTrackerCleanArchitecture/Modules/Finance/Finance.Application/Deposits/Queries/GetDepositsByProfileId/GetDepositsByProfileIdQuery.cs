using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Deposits.Queries.GetDepositsByProfileId;

public record GetDepositsByProfileIdQuery(Guid ProfileId) : IRequest<Result<IEnumerable<GetDepositsByProfileIdResponse>>>;
