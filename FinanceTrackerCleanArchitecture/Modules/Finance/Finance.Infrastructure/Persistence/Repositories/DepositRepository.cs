using Finance.Domain.Entities;
using Finance.Domain.Interfaces;
using Finance.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Finance.Infrastructure.Persistence.Repositories;

public class DepositRepository : IDepositRepository
{
  private readonly FinanceDbContext _context;

  public DepositRepository(FinanceDbContext context)
  {
    _context = context;
  }

  public async Task CreateAsync(Deposit deposit)
  {
    _context.Deposits.Add(deposit);
    await _context.SaveChangesAsync();
  }

  public async Task<Deposit?> GetByIdAsync(Guid id)
  {
    return await _context.Deposits.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id);
  }

  public async Task<IEnumerable<Deposit>> GetByProfileIdAsync(Guid profileId)
  {
    return await _context.Deposits.AsNoTracking().Where(d => d.ProfileId == profileId).ToListAsync();
  }

  public async Task UpdateAsync(Deposit deposit)
  {
    await _context.Deposits
      .Where(d => d.Id == deposit.Id)
      .ExecuteUpdateAsync(s => s
        .SetProperty(d => d.Name, deposit.Name)
        .SetProperty(d => d.CurrentAmount, deposit.CurrentAmount)
        .SetProperty(d => d.IsClosed, deposit.IsClosed)
        .SetProperty(d => d.UpdatedAt, DateTime.UtcNow));
  }

  public async Task DeleteAsync(Deposit deposit)
  {
    _context.Deposits.Remove(deposit);
    await _context.SaveChangesAsync();
  }
}
