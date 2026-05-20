using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Debts.Commands.RenameCreditor;

public record RenameCreditorCommand(Guid Id, string NewCreditorName) : IRequest<Result<bool>>;
