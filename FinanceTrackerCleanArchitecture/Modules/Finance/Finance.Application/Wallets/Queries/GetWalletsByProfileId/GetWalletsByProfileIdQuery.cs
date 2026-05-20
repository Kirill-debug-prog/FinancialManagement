using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Wallets.Queries.GetWalletsByProfileId;

public record GetWalletsByProfileIdQuery(Guid ProfileId) : IRequest<Result<IEnumerable<GetWalletsByProfileIdResponse>>>;
