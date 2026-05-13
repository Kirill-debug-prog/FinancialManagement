using Microsoft.EntityFrameworkCore;
using Users.Domain.Entities;

namespace Users.Infrastructure.Persistence;

public class UserDbContext : DbContext
{
  public DbSet<User> Users { get; set; }
  public DbSet<Profile> Profiles { get; set; }

  public UserDbContext(DbContextOptions<UserDbContext> options) : base(options)
  {
  }

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(UserDbContext).Assembly);
  }
}
