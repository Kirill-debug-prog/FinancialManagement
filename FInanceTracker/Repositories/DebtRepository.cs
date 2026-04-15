using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FInanceTracker.Repositories
{
    public class DebtRepository : IDebtRepository
    {
        private readonly AppDbContext _context;

        public DebtRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Debt?> GetByIdAsync(Guid id)
        {
            return await _context.Debts
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<List<Debt>> GetAllByProfileIdAsync(Guid profileId)
        {
            return await _context.Debts
                .Where(d => d.ProfileId == profileId)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task<Debt> CreateAsync(Debt debt)
        {
            _context.Debts.Add(debt);
            await _context.SaveChangesAsync();
            return debt;
        }

        public async Task UpdateAsync(Debt debt)
        {
            _context.Debts.Update(debt);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var debt = await _context.Debts.FindAsync(id);
            if (debt != null)
            {
                _context.Debts.Remove(debt);
                await _context.SaveChangesAsync();
            }
        }
    }
}
