using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Reports.Domain.Interfaces;

namespace Reports.Infrastructure.Storage;

public class S3FileStorage : IFileStorage
{
  private readonly IAmazonS3 _s3Client;
  private readonly S3Settings _settings;
  private readonly ILogger<S3FileStorage> _logger;

  public S3FileStorage(IAmazonS3 s3Client, IOptions<S3Settings> settings, ILogger<S3FileStorage> logger)
  {
    _s3Client = s3Client;
    _settings = settings.Value;
    _logger = logger;
  }

  public async Task<string> UploadAsync(
    Stream stream,
    string key,
    string contentType,
    CancellationToken cancellationToken = default)
  {
    if (stream.CanSeek)
      stream.Position = 0;

    var request = new PutObjectRequest
    {
      BucketName = _settings.Bucket,
      Key = key,
      InputStream = stream,
      ContentType = contentType,
      AutoCloseStream = false
    };

    _logger.LogInformation("Uploading object to S3: bucket={Bucket}, key={Key}", _settings.Bucket, key);

    try
    {
      var response = await _s3Client.PutObjectAsync(request, cancellationToken);

      if (response.HttpStatusCode != System.Net.HttpStatusCode.OK)
        throw new FileStorageException(
          $"S3 upload returned non-success status: {response.HttpStatusCode} for key '{key}' in bucket '{_settings.Bucket}'.");

      _logger.LogInformation("Uploaded to S3 successfully: key={Key}, etag={ETag}", key, response.ETag);
      return key;
    }
    catch (AmazonS3Exception ex)
    {
      throw new FileStorageException(
        $"S3 upload failed for key '{key}' in bucket '{_settings.Bucket}': {ex.Message}",
        ex);
    }
  }
  public Task<string> GeneratePresignedUrlAsync(
    string key,
    TimeSpan expiration,
    CancellationToken cancellationToken = default)
  {
    var request = new GetPreSignedUrlRequest
    {
      BucketName = _settings.Bucket,
      Key = key,
      Verb = HttpVerb.GET,
      Expires = DateTime.UtcNow.Add(expiration),
      Protocol = Protocol.HTTPS
    };

    try
    {
      var url = _s3Client.GetPreSignedURL(request);
      _logger.LogInformation("Generated presigned URL: key={Key}, expires in {Minutes}min", key, expiration.TotalMinutes);
      return Task.FromResult(url);
    }
    catch (AmazonS3Exception ex)
    {
      throw new FileStorageException(
        $"Failed to generate presigned URL for key '{key}': {ex.Message}",
        ex);
    }
  }
}