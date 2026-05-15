using Finance.Domain.Enums;

namespace Finance.Application.Analytics.Queries.GetCategoryAnalytics;

public record GetCategoryAnalyticsQuery(
    Guid ProfileId,
    FinancialType Type,
    DateOnly? DateFrom,
    DateOnly? DateTo);
