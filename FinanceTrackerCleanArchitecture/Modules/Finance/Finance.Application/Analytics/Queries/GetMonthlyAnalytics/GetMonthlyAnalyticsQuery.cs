using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Analytics.Queries.GetMonthlyAnalytics;

public record GetMonthlyAnalyticsQuery(Guid ProfileId, int Year) : IRequest<Result<IEnumerable<GetMonthlyAnalyticsResponse>>>;
