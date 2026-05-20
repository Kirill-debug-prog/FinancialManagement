using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Units.Commands.DeleteUnit;

public record DeleteUnitCommand(Guid Id) : IRequest<Result<bool>>;
