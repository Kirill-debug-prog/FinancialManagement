using Finance.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Finance.Infrastructure.Persistence.Configurations;

public class RecurringTransactionConfiguration : IEntityTypeConfiguration<RecurringTransaction>
{
  public void Configure(EntityTypeBuilder<RecurringTransaction> builder)
  {
    builder.HasKey(r => r.Id);
    builder.Property(r => r.Amount).HasColumnType("decimal(18,2)");
    builder.Property(r => r.Type).IsRequired();
    builder.Property(r => r.Interval).IsRequired();
    builder.Property(r => r.StartDate).IsRequired();
    builder.Property(r => r.EndDate).IsRequired(false);
    builder.Property(r => r.NextOccurrenceDate).IsRequired();
    builder.Property(r => r.IsActive).IsRequired();
    builder.Property(r => r.Description).IsRequired(false).HasMaxLength(500);
    builder.Property(r => r.ToWalletId).IsRequired(false);
    builder.Property(r => r.CategoryId).IsRequired(false);
    builder.HasOne(r => r.Wallet).WithMany().HasForeignKey(r => r.WalletId).OnDelete(DeleteBehavior.Restrict);
    builder.HasOne(r => r.ToWallet).WithMany().HasForeignKey(r => r.ToWalletId).IsRequired(false).OnDelete(DeleteBehavior.Restrict);
    builder.HasOne(r => r.Category).WithMany().HasForeignKey(r => r.CategoryId).IsRequired(false);
  }
}
