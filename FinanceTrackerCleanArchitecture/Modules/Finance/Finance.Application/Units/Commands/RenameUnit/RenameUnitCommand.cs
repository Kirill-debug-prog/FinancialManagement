using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Units.Commands.RenameUnit;

public record RenameUnitCommand(Guid Id, string Name, string ShortName) : IRequest<Result<bool>>;
