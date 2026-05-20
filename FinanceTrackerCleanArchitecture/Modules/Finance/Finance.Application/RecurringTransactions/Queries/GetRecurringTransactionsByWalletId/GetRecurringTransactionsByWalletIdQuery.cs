using MediatR;
using Core.Domain.Common;
namespace Finance.Application.RecurringTransactions.Queries.GetRecurringTransactionsByWalletId;

public record GetRecurringTransactionsByWalletIdQuery(Guid WalletId) : IRequest<Result<IEnumerable<GetRecurringTransactionsByWalletIdResponse>>>;
