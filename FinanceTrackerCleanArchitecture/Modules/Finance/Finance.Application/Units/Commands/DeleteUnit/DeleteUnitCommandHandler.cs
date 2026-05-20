using MediatR;
using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Units.Commands.DeleteUnit;

public class DeleteUnitCommandHandler : IRequestHandler<DeleteUnitCommand, Result<bool>>
{
  private readonly IUnitRepository _unitRepository;

  public DeleteUnitCommandHandler(IUnitRepository unitRepository)
  {
    _unitRepository = unitRepository;
  }

  public async Task<Result<bool>> Handle(DeleteUnitCommand command, CancellationToken cancellationToken)
  {
    var unit = await _unitRepository.GetByIdAsync(command.Id);
    if (unit is null)
      return Result<bool>.Failure(new DomainError("Unit.NotFound", "Unit not found."));

    if (unit.IsSystem)
      return Result<bool>.Failure(new DomainError("Unit.CannotDelete", "System units cannot be deleted."));

    await _unitRepository.DeleteAsync(unit);
    return Result<bool>.Success(true);
  }
}
