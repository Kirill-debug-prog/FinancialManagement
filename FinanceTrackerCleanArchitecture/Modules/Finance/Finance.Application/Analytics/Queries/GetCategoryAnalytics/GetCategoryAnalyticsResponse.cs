namespace Finance.Application.Analytics.Queries.GetCategoryAnalytics;

public record GetCategoryAnalyticsResponse(
    string Name,
    decimal Value,
    string Color);
