using Finance.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Finance.Infrastructure.Persistence.Configurations;

public class DepositConfiguration : IEntityTypeConfiguration<Deposit>
{
  public void Configure(EntityTypeBuilder<Deposit> builder)
  {
    builder.HasKey(d => d.Id);
    builder.Property(d => d.Name).IsRequired().HasMaxLength(256);
    builder.Property(d => d.InitialAmount).HasColumnType("decimal(18,2)");
    builder.Property(d => d.CurrentAmount).HasColumnType("decimal(18,2)");
    builder.Property(d => d.InterestRate).HasColumnType("decimal(5,2)");
    builder.Property(d => d.IsCapitalized).IsRequired();
    builder.Property(d => d.IsClosed).IsRequired();
    builder.Property(d => d.ProfileId).IsRequired();
    builder.HasIndex(d => d.ProfileId);
    builder.HasOne(d => d.Currency).WithMany().HasForeignKey(d => d.CurrencyId);
  }
}
