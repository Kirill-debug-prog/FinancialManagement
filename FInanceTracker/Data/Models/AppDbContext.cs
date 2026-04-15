using Microsoft.EntityFrameworkCore;

namespace FInanceTracker.Data.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public AppDbContext()
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Profile> Profiles { get; set; }
    public DbSet<Currency> Currencies { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<UnitOfMeasure> UnitsOfMeasure { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<Credit> Credits { get; set; }
    public DbSet<Debt> Debts { get; set; }
    public DbSet<Deposit> Deposits { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseNpgsql("Server=localhost;Port=5432;Database=FinanceTracker;Username=postgres;Password=12345");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnType("uuid")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(255);

            entity.HasIndex(e => e.Email).IsUnique();

            entity.Property(e => e.Password)
                .IsRequired()
                .HasMaxLength(500);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()");

            entity.HasMany(e => e.Profiles)
                .WithOne(p => p.User)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Profile>(entity =>
        {
            entity.ToTable("profiles");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnType("uuid")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.MainCurrency)
                .IsRequired()
                .HasMaxLength(10);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()");

            entity.HasIndex(e => e.UserId);
        });

        modelBuilder.Entity<Currency>(entity =>
        {
            entity.ToTable("currencies");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnType("uuid")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.Code)
                .IsRequired()
                .HasMaxLength(10);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.ShortName)
                .IsRequired()
                .HasMaxLength(10);

            entity.HasOne(e => e.Profile)
                .WithMany(p => p.Currencies)
                .HasForeignKey(e => e.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.ProfileId, e.Code }).IsUnique();
        });

        modelBuilder.Entity<Account>(entity =>
        {
            entity.ToTable("accounts");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnType("uuid")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Icon)
                .HasMaxLength(50);

            entity.Property(e => e.InitialBalance)
                .HasColumnType("decimal(18,2)");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Profile)
                .WithMany(p => p.Accounts)
                .HasForeignKey(e => e.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Currency)
                .WithMany(c => c.Accounts)
                .HasForeignKey(e => e.CurrencyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.ProfileId);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("categories");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnType("uuid")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Type)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.HasOne(e => e.Profile)
                .WithMany(p => p.Categories)
                .HasForeignKey(e => e.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Parent)
                .WithMany(c => c.Subcategories)
                .HasForeignKey(e => e.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.ProfileId);
        });

        modelBuilder.Entity<UnitOfMeasure>(entity =>
        {
            entity.ToTable("units_of_measure");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnType("uuid")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasOne(e => e.Profile)
                .WithMany(p => p.UnitsOfMeasure)
                .HasForeignKey(e => e.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.ProfileId);
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.ToTable("transactions");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnType("uuid")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.Type)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(e => e.Amount)
                .HasColumnType("decimal(18,2)");

            entity.Property(e => e.Quantity)
                .HasColumnType("decimal(18,4)")
                .HasDefaultValue(1);

            entity.Property(e => e.DiscountPercent)
                .HasColumnType("decimal(5,2)");

            entity.Property(e => e.TotalAmount)
                .HasColumnType("decimal(18,2)");

            entity.Property(e => e.Date)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Profile)
                .WithMany(p => p.Transactions)
                .HasForeignKey(e => e.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Account)
                .WithMany(a => a.Transactions)
                .HasForeignKey(e => e.AccountId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Transactions)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Currency)
                .WithMany(c => c.Transactions)
                .HasForeignKey(e => e.CurrencyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.UnitOfMeasure)
                .WithMany(u => u.Transactions)
                .HasForeignKey(e => e.UnitOfMeasureId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.ProfileId);
            entity.HasIndex(e => e.AccountId);
            entity.HasIndex(e => e.Date);
        });

        modelBuilder.Entity<Credit>(entity =>
        {
            entity.ToTable("credits");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnType("uuid")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Type)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.TotalAmount)
                .HasColumnType("decimal(18,2)");

            entity.Property(e => e.RemainingAmount)
                .HasColumnType("decimal(18,2)");

            entity.Property(e => e.InterestRate)
                .HasColumnType("decimal(5,2)");

            entity.Property(e => e.MonthlyPayment)
                .HasColumnType("decimal(18,2)");

            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Profile)
                .WithMany(p => p.Credits)
                .HasForeignKey(e => e.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.ProfileId);
        });

        modelBuilder.Entity<Debt>(entity =>
        {
            entity.ToTable("debts");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnType("uuid")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Amount)
                .HasColumnType("decimal(18,2)");

            entity.Property(e => e.Person)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Date)
                .IsRequired();

            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Profile)
                .WithMany(p => p.Debts)
                .HasForeignKey(e => e.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.ProfileId);
        });

        modelBuilder.Entity<Deposit>(entity =>
        {
            entity.ToTable("deposits");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnType("uuid")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Bank)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Amount)
                .HasColumnType("decimal(18,2)");

            entity.Property(e => e.InterestRate)
                .HasColumnType("decimal(5,2)");

            entity.Property(e => e.StartDate)
                .IsRequired();

            entity.Property(e => e.Type)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Profile)
                .WithMany(p => p.Deposits)
                .HasForeignKey(e => e.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.ProfileId);
        });
    }
}
