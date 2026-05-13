using Core.Domain.Common;
using Core.Domain.Entities;

namespace Finance.Domain.Entities;

public class Unit : BaseEntity
{
  public string Name { get; private set; } = string.Empty;
  public string ShortName { get; private set; } = string.Empty;
  public bool IsSystem { get; private set; } = false;
  public Guid? ProfileId { get; private set; }

  private Unit() : base() { }

  private Unit(Guid id, string name, string shortName, bool isSystem, Guid? profileId) : base(id)
  {
    Name = name;
    ShortName = shortName;
    IsSystem = isSystem;
    ProfileId = profileId;
  }

  public static Result<Unit> Create(string name, string shortName, Guid profileId)
  {
    if (string.IsNullOrWhiteSpace(name))
      return Result<Unit>.Failure(new DomainError("Unit.InvalidName", "Name is required."));

    if (string.IsNullOrWhiteSpace(shortName))
      return Result<Unit>.Failure(new DomainError("Unit.InvalidShortName", "Short name is required."));

    return Result<Unit>.Success(new Unit(Guid.NewGuid(), name, shortName, isSystem: false, profileId));
  }

  public static Result<Unit> CreateSystem(string name, string shortName)
  {
    if (string.IsNullOrWhiteSpace(name))
      return Result<Unit>.Failure(new DomainError("Unit.InvalidName", "Name is required."));

    if (string.IsNullOrWhiteSpace(shortName))
      return Result<Unit>.Failure(new DomainError("Unit.InvalidShortName", "Short name is required."));

    return Result<Unit>.Success(new Unit(Guid.NewGuid(), name, shortName, isSystem: true, profileId: null));
  }

  public void Rename(string name, string shortName)
  {
    Name = name;
    ShortName = shortName;
    SetUpdated();
  }
}
