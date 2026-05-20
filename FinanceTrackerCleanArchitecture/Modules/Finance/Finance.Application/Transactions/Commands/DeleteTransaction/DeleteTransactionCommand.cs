using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Transactions.Commands.DeleteTransaction;

public record DeleteTransactionCommand(Guid Id) : IRequest<Result<bool>>;
