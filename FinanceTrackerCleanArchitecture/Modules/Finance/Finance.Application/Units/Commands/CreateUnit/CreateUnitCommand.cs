using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Units.Commands.CreateUnit;

public record CreateUnitCommand(Guid ProfileId, string Name, string ShortName) : IRequest<Result<Guid>>;
