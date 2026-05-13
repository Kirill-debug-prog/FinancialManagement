namespace Reports.Domain.Interfaces;

public interface IFileStorage
{
  Task<string> UploadAsync(
    Stream stream,
    string key,
    string contentType,
    CancellationToken ct = default);

  Task<string> GeneratePresignedUrlAsync(
    string key,
    TimeSpan expiration,
    CancellationToken ct = default);
}