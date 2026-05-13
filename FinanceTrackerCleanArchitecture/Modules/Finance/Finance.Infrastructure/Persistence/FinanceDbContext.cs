using Finance.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Finance.Infrastructure.Persistence;

public class FinanceDbContext : DbContext
{
  public DbSet<Wallet> Wallets { get; set; }
  public DbSet<Currency> Currencies { get; set; }
  public DbSet<Transaction> Transactions { get; set; }
  public DbSet<RecurringTransaction> RecurringTransactions { get; set; }
  public DbSet<Category> Categories { get; set; }
  public DbSet<Unit> Units { get; set; }
  public DbSet<Credit> Credits { get; set; }
  public DbSet<Debt> Debts { get; set; }
  public DbSet<Deposit> Deposits { get; set; }

  public FinanceDbContext(DbContextOptions<FinanceDbContext> options) : base(options)
  {
  }

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(FinanceDbContext).Assembly);
  }
}
