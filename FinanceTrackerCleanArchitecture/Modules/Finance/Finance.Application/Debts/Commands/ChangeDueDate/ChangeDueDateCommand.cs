using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Debts.Commands.ChangeDueDate;

public record ChangeDueDateCommand(Guid Id, DateOnly? NewDueDate) : IRequest<Result<bool>>;
