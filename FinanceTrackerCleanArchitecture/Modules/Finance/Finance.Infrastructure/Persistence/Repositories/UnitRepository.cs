using Finance.Domain.Entities;
using Finance.Domain.Interfaces;
using Finance.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Finance.Infrastructure.Persistence.Repositories;

public class UnitRepository : IUnitRepository
{
  private readonly FinanceDbContext _context;

  public UnitRepository(FinanceDbContext context)
  {
    _context = context;
  }

  public async Task<Unit?> GetByIdAsync(Guid id)
  {
    return await _context.Units.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
  }

  public async Task<IEnumerable<Unit>> GetAllAsync()
  {
    return await _context.Units.AsNoTracking().ToListAsync();
  }

  public async Task<IEnumerable<Unit>> GetByProfileIdAsync(Guid profileId)
  {
    return await _context.Units
      .AsNoTracking()
      .Where(u => u.IsSystem || u.ProfileId == profileId)
      .ToListAsync();
  }

  public async Task AddAsync(Unit unit)
  {
    _context.Units.Add(unit);
    await _context.SaveChangesAsync();
  }

  public async Task UpdateAsync(Unit unit)
  {
    await _context.Units
      .Where(u => u.Id == unit.Id)
      .ExecuteUpdateAsync(s => s
        .SetProperty(u => u.Name, unit.Name)
        .SetProperty(u => u.ShortName, unit.ShortName)
        .SetProperty(u => u.UpdatedAt, DateTime.UtcNow));
  }

  public async Task DeleteAsync(Unit unit)
  {
    _context.Units.Remove(unit);
    await _context.SaveChangesAsync();
  }
}
