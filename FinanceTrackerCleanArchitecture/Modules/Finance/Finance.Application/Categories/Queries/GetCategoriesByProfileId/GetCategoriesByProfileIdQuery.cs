using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Categories.Queries.GetCategoriesByProfileId;

public record GetCategoriesByProfileIdQuery(Guid ProfileId) : IRequest<Result<IEnumerable<GetCategoriesByProfileIdResponse>>>;
