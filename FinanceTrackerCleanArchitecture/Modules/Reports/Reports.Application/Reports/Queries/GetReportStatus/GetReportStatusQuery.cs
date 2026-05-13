namespace Reports.Application.Reports.Queries.GetReportStatus;

public record GetReportStatusQuery(Guid ReportId, Guid RequestedBy);