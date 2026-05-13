using Core.Domain.Common;
using Finance.Domain.Interfaces;

namespace Finance.Application.Categories.Queries.GetCategoriesByProfileId;

public class GetCategoriesByProfileIdQueryHandler
{
  private readonly ICategoryRepository _categoryRepository;

  public GetCategoriesByProfileIdQueryHandler(ICategoryRepository categoryRepository)
  {
    _categoryRepository = categoryRepository;
  }

  public async Task<Result<IEnumerable<GetCategoriesByProfileIdResponse>>> Handle(GetCategoriesByProfileIdQuery query)
  {
    var categories = await _categoryRepository.GetByProfileIdAsync(query.ProfileId);

    var response = categories.Select(c => new GetCategoriesByProfileIdResponse(
      c.Id, c.Name, c.Type, c.Icon, c.IsSystem, c.ProfileId));

    return Result<IEnumerable<GetCategoriesByProfileIdResponse>>.Success(response);
  }
}
