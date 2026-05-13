using Finance.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Finance.Infrastructure.Persistence.Configurations;

public class CreditConfiguration : IEntityTypeConfiguration<Credit>
{
  public void Configure(EntityTypeBuilder<Credit> builder)
  {
    builder.HasKey(c => c.Id);
    builder.Property(c => c.Name).IsRequired().HasMaxLength(256);
    builder.Property(c => c.TotalAmount).HasColumnType("decimal(18,2)");
    builder.Property(c => c.RemainingAmount).HasColumnType("decimal(18,2)");
    builder.Property(c => c.MonthlyPayment).HasColumnType("decimal(18,2)");
    builder.Property(c => c.InterestRate).HasColumnType("decimal(5,2)");
    builder.Property(c => c.IsClosed).IsRequired();
    builder.Property(c => c.ProfileId).IsRequired();
    builder.HasOne(c => c.Currency).WithMany().HasForeignKey(c => c.CurrencyId);
  }
}
