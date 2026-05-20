using MediatR;
using Core.Domain.Common;
using Finance.Domain.Entities;
using Finance.Domain.Interfaces;

namespace Finance.Application.Categories.Commands.CreateCategory;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Result<Guid>>
{
  private readonly ICategoryRepository _categoryRepository;
  private readonly IProfileChecker _profileChecker;

  public CreateCategoryCommandHandler(ICategoryRepository categoryRepository, IProfileChecker profileChecker)
  {
    _categoryRepository = categoryRepository;
    _profileChecker = profileChecker;
  }

  public async Task<Result<Guid>> Handle(CreateCategoryCommand command, CancellationToken cancellationToken)
  {
    if (!await _profileChecker.ExistsAsync(command.ProfileId))
      return Result<Guid>.Failure(new DomainError("Category.ProfileNotFound", "Profile not found."));

    var (profileId, name, type, icon) = command;
    var category = Category.Create(name, type, profileId, icon);

    if (category.IsFailure)
      return Result<Guid>.Failure(category.Error!);

    await _categoryRepository.CreateAsync(category.Value!);
    return Result<Guid>.Success(category.Value!.Id);
  }
}
