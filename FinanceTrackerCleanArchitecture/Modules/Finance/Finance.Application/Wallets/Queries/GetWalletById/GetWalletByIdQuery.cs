using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Wallets.Queries.GetWalletById;

public record GetWalletByIdQuery(Guid Id) : IRequest<Result<GetWalletByIdResponse>>;
