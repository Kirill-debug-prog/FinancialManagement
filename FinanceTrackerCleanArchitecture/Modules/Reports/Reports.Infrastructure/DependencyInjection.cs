using Amazon.Runtime;
using Amazon.S3;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Reports.Domain.Interfaces;
using Reports.Infrastructure.Persistence;
using Reports.Infrastructure.Persistence.Repositories;
using Reports.Infrastructure.Storage;
using Hangfire;
using Hangfire.PostgreSql;
using Reports.Infrastructure.Pipeline;
using Reports.Infrastructure.Generators;

namespace Reports.Infrastructure;

public static class DependencyInjection
{
  public static IServiceCollection AddReportsModule(this IServiceCollection services, IConfiguration configuration)
  {
    services.AddDbContext<ReportsDbContext>(options =>
      options.UseNpgsql(
        configuration.GetConnectionString("DefaultConnection"),
        npgsql => npgsql.MigrationsHistoryTable("__EFMigrationsHistory", ReportsDbContext.Schema)));

    services.AddScoped<IReportJobRepository, ReportJobRepository>();

    services.Configure<S3Settings>(configuration.GetSection(S3Settings.SectionName));

    services.AddSingleton<IAmazonS3>(sp =>
    {
      var settings = configuration.GetSection(S3Settings.SectionName).Get<S3Settings>()
        ?? throw new InvalidOperationException("S3 configuration section is missing or empty.");

      var s3Config = new AmazonS3Config
      {
        ServiceURL = settings.ServiceUrl,
        AuthenticationRegion = settings.Region,
        ForcePathStyle = true
      };

      var credentials = new BasicAWSCredentials(settings.AccessKey, settings.SecretKey);
      return new AmazonS3Client(credentials, s3Config);
    });

    services.AddScoped<IFileStorage, S3FileStorage>();
    services.AddScoped<IReportGenerator, ProfileTransactionsReportGenerator>();
    services.AddScoped<IReportPipeline, ReportPipeline>();
    
    services.AddHangfire(config => config
      .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
      .UseSimpleAssemblyNameTypeSerializer()
      .UseRecommendedSerializerSettings()
      .UsePostgreSqlStorage(options =>
      {
        options.UseNpgsqlConnection(configuration.GetConnectionString("DefaultConnection"));
      }));

    services.AddHangfireServer(options =>
    {
      options.Queues = new[] { "reports", "default" };
      options.WorkerCount = 2;
    });

    return services;
  }
}