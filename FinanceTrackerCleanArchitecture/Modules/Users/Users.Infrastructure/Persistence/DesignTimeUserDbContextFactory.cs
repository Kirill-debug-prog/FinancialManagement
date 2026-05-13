using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Users.Infrastructure.Persistence;

public class DesignTimeUserDbContextFactory : IDesignTimeDbContextFactory<UserDbContext>
{
  public UserDbContext CreateDbContext(string[] args)
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

    var optionsBuilder = new DbContextOptionsBuilder<UserDbContext>();
    optionsBuilder.UseNpgsql(
      connectionString,
      npgsql => npgsql.MigrationsHistoryTable("__EFMigrationsHistory", UserDbContext.Schema));

    return new UserDbContext(optionsBuilder.Options);
  }

  private static string FindApiProjectPath()
  {
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
