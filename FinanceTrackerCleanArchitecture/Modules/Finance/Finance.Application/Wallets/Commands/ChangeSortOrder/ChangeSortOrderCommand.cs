using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Wallets.Commands.ChangeSortOrder;

public record ChangeSortOrderCommand(Guid Id, int NewSortOrder) : IRequest<Result<bool>>;
