using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Credits.Commands.RenameCredit;

public record RenameCreditCommand(Guid Id, string NewName) : IRequest<Result<bool>>;
