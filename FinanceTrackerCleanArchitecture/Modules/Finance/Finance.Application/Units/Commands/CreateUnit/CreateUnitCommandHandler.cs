using MediatR;
using Core.Domain.Common;
using Finance.Domain.Entities;
using Finance.Domain.Interfaces;
using Unit = Finance.Domain.Entities.Unit;

namespace Finance.Application.Units.Commands.CreateUnit;

public class CreateUnitCommandHandler : IRequestHandler<CreateUnitCommand, Result<Guid>>
{
  private readonly IUnitRepository _unitRepository;
  private readonly IProfileChecker _profileChecker;

  public CreateUnitCommandHandler(IUnitRepository unitRepository, IProfileChecker profileChecker)
  {
    _unitRepository = unitRepository;
    _profileChecker = profileChecker;
  }

  public async Task<Result<Guid>> Handle(CreateUnitCommand command, CancellationToken cancellationToken)
  {
    if (!await _profileChecker.ExistsAsync(command.ProfileId))
      return Result<Guid>.Failure(new DomainError("Unit.ProfileNotFound", "Profile not found."));

    var unit = Unit.Create(command.Name, command.ShortName, command.ProfileId);
    if (unit.IsFailure)
      return Result<Guid>.Failure(unit.Error!);

    await _unitRepository.AddAsync(unit.Value!);
    return Result<Guid>.Success(unit.Value!.Id);
  }
}
