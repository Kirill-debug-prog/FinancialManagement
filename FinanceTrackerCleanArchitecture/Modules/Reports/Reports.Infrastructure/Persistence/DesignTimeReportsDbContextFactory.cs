using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Reports.Infrastructure.Persistence;

public class DesignTimeReportsDbContextFactory : IDesignTimeDbContextFactory<ReportsDbContext>
{
  public ReportsDbContext CreateDbContext(string[] args)
  {
    var apiProjectPath = FindApiProjectPath();

    var configuration = new ConfigurationBuilder()
      .SetBasePath(apiProjectPath)
      .AddJsonFile("appsettings.json", optional: false)
      .AddJsonFile("appsettings.Development.json", optional: true)
      .AddEnvironmentVariables()
      .Build();

    var connectionString = configuration.GetConnectionString("DefaultConnection")
      ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' not found. " +
        $"Searched in: {apiProjectPath}");

    var optionsBuilder = new DbContextOptionsBuilder<ReportsDbContext>();
    optionsBuilder.UseNpgsql(
      connectionString,
      npgsql => npgsql.MigrationsHistoryTable("__EFMigrationsHistory", ReportsDbContext.Schema));

    return new ReportsDbContext(optionsBuilder.Options);
  }

  private static string FindApiProjectPath()
  {
    // ищем .slnx файл, поднимаясь от текущей сборки наверх
    var current = new DirectoryInfo(AppContext.BaseDirectory);

    while (current is not null)
    {
      if (current.GetFiles("*.slnx").Any() || current.GetFiles("*.sln").Any())
      {
        var apiPath = Path.Combine(current.FullName, "Core", "Core.API");
        if (Directory.Exists(apiPath))
          return apiPath;

        throw new InvalidOperationException(
          $"Found solution at '{current.FullName}', but no 'Core/Core.API' subfolder.");
      }
      current = current.Parent;
    }

    throw new InvalidOperationException(
      $"Could not find solution root (looked for *.slnx or *.sln). " +
      $"Started search from: {AppContext.BaseDirectory}");
  }
}