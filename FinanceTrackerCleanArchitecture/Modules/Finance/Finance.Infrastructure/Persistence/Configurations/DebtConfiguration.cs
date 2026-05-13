using Finance.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Finance.Infrastructure.Persistence.Configurations;

public class DebtConfiguration : IEntityTypeConfiguration<Debt>
{
  public void Configure(EntityTypeBuilder<Debt> builder)
  {
    builder.HasKey(d => d.Id);
    builder.Property(d => d.CreditorName).IsRequired().HasMaxLength(256);
    builder.Property(d => d.TotalAmount).HasColumnType("decimal(18,2)");
    builder.Property(d => d.RemainingAmount).HasColumnType("decimal(18,2)");
    builder.Property(d => d.DueDate).IsRequired(false);
    builder.Property(d => d.IsRepaid).IsRequired();
    builder.Property(d => d.ProfileId).IsRequired();
    builder.HasIndex(d => d.ProfileId);
    builder.HasOne(d => d.Currency).WithMany().HasForeignKey(d => d.CurrencyId);
  }
}
