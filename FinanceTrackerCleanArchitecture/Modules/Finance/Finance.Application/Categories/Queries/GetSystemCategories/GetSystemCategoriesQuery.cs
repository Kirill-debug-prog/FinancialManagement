using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Categories.Queries.GetSystemCategories;

public record GetSystemCategoriesQuery() : IRequest<Result<IEnumerable<GetSystemCategoriesResponse>>>;
