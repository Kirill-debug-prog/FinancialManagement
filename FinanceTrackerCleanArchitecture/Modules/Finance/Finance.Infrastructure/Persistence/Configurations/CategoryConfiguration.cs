using Finance.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Finance.Infrastructure.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
  public void Configure(EntityTypeBuilder<Category> builder)
  {
    builder.HasKey(c => c.Id);
    builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
    builder.Property(c => c.Type).IsRequired();
    builder.Property(c => c.Icon).IsRequired(false);
    builder.Property(c => c.IsSystem).IsRequired();
    builder.Property(c => c.ProfileId).IsRequired(false);
  }
}
