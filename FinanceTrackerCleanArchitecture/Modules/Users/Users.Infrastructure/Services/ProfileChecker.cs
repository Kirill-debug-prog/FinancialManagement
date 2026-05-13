using Finance.Domain.Interfaces;
using Users.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Users.Infrastructure.Services;

public class ProfileChecker : IProfileChecker
{
  private readonly UserDbContext _context;

  public ProfileChecker(UserDbContext context)
  {
    _context = context;
  }

  public async Task<bool> ExistsAsync(Guid profileId)
  {
    return await _context.Profiles.AnyAsync(p => p.Id == profileId);
  }
}
