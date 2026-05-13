using Finance.Domain.Enums;
using Core.Domain.Entities;
using Core.Domain.Common;

namespace Finance.Domain.Entities;

public class Category : BaseEntity
{
  public string Name { get; private set; } = string.Empty;
  public FinancialType Type { get; private set; }
  public string? Icon { get; private set; }
  public bool IsSystem { get; private set; } = false;
  public Guid? ProfileId { get; private set; }

  private Category() : base() { }

  private Category(Guid id, string name, FinancialType type, string? icon, bool isSystem, Guid? profileId) : base(id)
  {
    Name = name;
    Type = type;
    Icon = icon;
    IsSystem = isSystem;
    ProfileId = profileId;
  }

  public static Result<Category> Create(string name, FinancialType type, Guid profileId, string? icon = null)
  {
    if (string.IsNullOrWhiteSpace(name))
      return Result<Category>.Failure(new DomainError("Category.InvalidName", "Name is required."));

    if (name.Length > 100)
      return Result<Category>.Failure(new DomainError("Category.InvalidName", "Name must be 100 characters or less."));

    return Result<Category>.Success(new Category(Guid.NewGuid(), name, type, icon, isSystem: false, profileId));
  }

  public static Result<Category> CreateSystem(string name, FinancialType type, string? icon = null)
  {
    if (string.IsNullOrWhiteSpace(name))
      return Result<Category>.Failure(new DomainError("Category.InvalidName", "Name is required."));

    if (name.Length > 100)
      return Result<Category>.Failure(new DomainError("Category.InvalidName", "Name must be 100 characters or less."));

    return Result<Category>.Success(new Category(Guid.NewGuid(), name, type, icon, isSystem: true, profileId: null));
  }

  public Result<bool> Rename(string newName)
  {
    if (string.IsNullOrWhiteSpace(newName))
      return Result<bool>.Failure(new DomainError("Category.InvalidName", "Name is required."));

    if (newName.Length > 100)
      return Result<bool>.Failure(new DomainError("Category.InvalidName", "Name must be 100 characters or less."));

    Name = newName;
    SetUpdated();
    return Result<bool>.Success(true);
  }

  public void ChangeIcon(string? newIcon)
  {
    Icon = newIcon;
    SetUpdated();
  }
}
