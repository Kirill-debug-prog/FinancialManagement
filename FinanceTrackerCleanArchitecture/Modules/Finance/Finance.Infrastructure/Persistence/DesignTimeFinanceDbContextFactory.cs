using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Finance.Infrastructure.Persistence;

public class DesignTimeFinanceDbContextFactory : IDesignTimeDbContextFactory<FinanceDbContext>
{
  public FinanceDbContext CreateDbContext(string[] args)
  {
    var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
      ?? "Host=localhost;Port=5432;Database=FinanceTrackerCA;Username=postgres;Password=12345";

    var optionsBuilder = new DbContextOptionsBuilder<FinanceDbContext>();
    optionsBuilder.UseNpgsql(connectionString);

    return new FinanceDbContext(optionsBuilder.Options);
  }
}
