using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FInanceTracker.Repositories
{
    public class DepositRepository : IDepositRepository
    {
        private readonly AppDbContext _context;

        public DepositRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Deposit?> GetByIdAsync(Guid id)
        {
            return await _context.Deposits
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<List<Deposit>> GetAllByProfileIdAsync(Guid profileId)
        {
            return await _context.Deposits
                .Where(d => d.ProfileId == profileId)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task<Deposit> CreateAsync(Deposit deposit)
        {
            _context.Deposits.Add(deposit);
            await _context.SaveChangesAsync();
            return deposit;
        }

        public async Task UpdateAsync(Deposit deposit)
        {
            _context.Deposits.Update(deposit);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var deposit = await _context.Deposits.FindAsync(id);
            if (deposit != null)
            {
                _context.Deposits.Remove(deposit);
                await _context.SaveChangesAsync();
            }
        }
    }
}
