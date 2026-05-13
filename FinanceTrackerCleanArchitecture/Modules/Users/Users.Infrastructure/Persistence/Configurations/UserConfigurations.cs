using Users.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Users.Infrastructure.Persistence.Configurations;

public class UserConfigurations : IEntityTypeConfiguration<User>
{
  public void Configure(EntityTypeBuilder<User> builder)
  {
    builder.HasKey(u => u.Id);
    builder.OwnsOne(u => u.Email, email =>
    {
      email.Property(e => e.Value).HasColumnName("Email");
    });
    builder.OwnsOne(u => u.PasswordHash, hash =>
    {
      hash.Property(h => h.Value).HasColumnName("PasswordHash");
    });
    builder.HasMany(u => u.Profiles).WithOne(p => p.User).HasForeignKey(p => p.UserId);
  }
}