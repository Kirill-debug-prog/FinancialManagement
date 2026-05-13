using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Categories.Queries.GetSystemCategories;

public class GetSystemCategoriesQueryHandler
{
  private readonly ICategoryRepository _categoryRepository;

  public GetSystemCategoriesQueryHandler(ICategoryRepository categoryRepository)
  {
    _categoryRepository = categoryRepository;
  }

  public async Task<Result<IEnumerable<GetSystemCategoriesResponse>>> Handle(GetSystemCategoriesQuery query)
  {
    var categories = await _categoryRepository.GetSystemCategoriesAsync();

    var response = categories.Select(c => new GetSystemCategoriesResponse(c.Id, c.Name, c.Type, c.Icon));

    return Result<IEnumerable<GetSystemCategoriesResponse>>.Success(response);
  }
}
