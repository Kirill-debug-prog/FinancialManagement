using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Transactions.Commands.ChangeCategory;

public record ChangeCategoryTransactionCommand(Guid Id, Guid? NewCategoryId) : IRequest<Result<bool>>;
