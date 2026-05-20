using MediatR;
using Core.Domain.Common;
using Finance.Domain.Enums;

namespace Finance.Application.Analytics.Queries.GetCategoryAnalytics;

public record GetCategoryAnalyticsQuery(
    Guid ProfileId,
    FinancialType Type,
    DateOnly? DateFrom,
    DateOnly? DateTo) : IRequest<Result<IEnumerable<GetCategoryAnalyticsResponse>>>;
