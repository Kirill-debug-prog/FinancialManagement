namespace Reports.Application.Reports.Queries.GetReportDownloadUrl;

public record GetReportDownloadUrlQuery(Guid ReportId, Guid RequestedBy);