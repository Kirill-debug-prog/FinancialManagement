using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Transactions.Queries.GetTransactionsByWalletId;

public record GetTransactionsByWalletIdQuery(Guid WalletId) : IRequest<Result<IEnumerable<GetTransactionsByWalletIdResponse>>>;
