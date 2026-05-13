using Finance.Domain.Entities;
using Finance.Domain.Interfaces;
using Finance.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Finance.Infrastructure.Persistence.Repositories;

public class CreditRepository : ICreditRepository
{
  private readonly FinanceDbContext _context;

  public CreditRepository(FinanceDbContext context)
  {
    _context = context;
  }

  public async Task CreateAsync(Credit credit)
  {
    _context.Credits.Add(credit);
    await _context.SaveChangesAsync();
  }

  public async Task<Credit?> GetByIdAsync(Guid id)
  {
    return await _context.Credits.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
  }

  public async Task<IEnumerable<Credit>> GetByProfileIdAsync(Guid profileId)
  {
    return await _context.Credits.AsNoTracking().Where(c => c.ProfileId == profileId).ToListAsync();
  }

  public async Task UpdateAsync(Credit credit)
  {
    await _context.Credits
      .Where(c => c.Id == credit.Id)
      .ExecuteUpdateAsync(s => s
        .SetProperty(c => c.Name, credit.Name)
        .SetProperty(c => c.RemainingAmount, credit.RemainingAmount)
        .SetProperty(c => c.MonthlyPayment, credit.MonthlyPayment)
        .SetProperty(c => c.InterestRate, credit.InterestRate)
        .SetProperty(c => c.IsClosed, credit.IsClosed)
        .SetProperty(c => c.UpdatedAt, DateTime.UtcNow));
  }

  public async Task DeleteAsync(Credit credit)
  {
    _context.Credits.Remove(credit);
    await _context.SaveChangesAsync();
  }
}
