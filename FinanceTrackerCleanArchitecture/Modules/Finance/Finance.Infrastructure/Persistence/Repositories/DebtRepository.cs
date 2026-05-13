using Finance.Domain.Entities;
using Finance.Domain.Interfaces;
using Finance.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Finance.Infrastructure.Persistence.Repositories;

public class DebtRepository : IDebtRepository
{
  private readonly FinanceDbContext _context;

  public DebtRepository(FinanceDbContext context)
  {
    _context = context;
  }

  public async Task CreateAsync(Debt debt)
  {
    _context.Debts.Add(debt);
    await _context.SaveChangesAsync();
  }

  public async Task<Debt?> GetByIdAsync(Guid id)
  {
    return await _context.Debts.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id);
  }

  public async Task<IEnumerable<Debt>> GetByProfileIdAsync(Guid profileId)
  {
    return await _context.Debts.AsNoTracking().Where(d => d.ProfileId == profileId).ToListAsync();
  }

  public async Task UpdateAsync(Debt debt)
  {
    await _context.Debts
      .Where(d => d.Id == debt.Id)
      .ExecuteUpdateAsync(s => s
        .SetProperty(d => d.CreditorName, debt.CreditorName)
        .SetProperty(d => d.RemainingAmount, debt.RemainingAmount)
        .SetProperty(d => d.DueDate, debt.DueDate)
        .SetProperty(d => d.IsRepaid, debt.IsRepaid)
        .SetProperty(d => d.UpdatedAt, DateTime.UtcNow));
  }

  public async Task DeleteAsync(Debt debt)
  {
    _context.Debts.Remove(debt);
    await _context.SaveChangesAsync();
  }
}
