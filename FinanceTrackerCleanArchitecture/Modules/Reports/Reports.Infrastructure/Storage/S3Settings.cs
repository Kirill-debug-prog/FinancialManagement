namespace Reports.Infrastructure.Storage;

public class S3Settings
{
  public const string SectionName = "S3";

  public string ServiceUrl { get; set; } = string.Empty;
  public string Region { get; set; } = string.Empty;
  public string AccessKey { get; set; } = string.Empty;
  public string SecretKey { get; set; } = string.Empty;
  public string Bucket { get; set; } = string.Empty;
  public int PresignedUrlExpirationMinutes { get; set; } = 15;
}