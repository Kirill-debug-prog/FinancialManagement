using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FInanceTracker.Repositories
{
    public class CreditRepository : ICreditRepository
    {
        private readonly AppDbContext _context;

        public CreditRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Credit?> GetByIdAsync(Guid id)
        {
            return await _context.Credits
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<List<Credit>> GetAllByProfileIdAsync(Guid profileId)
        {
            return await _context.Credits
                .Where(c => c.ProfileId == profileId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Credit> CreateAsync(Credit credit)
        {
            _context.Credits.Add(credit);
            await _context.SaveChangesAsync();
            return credit;
        }

        public async Task UpdateAsync(Credit credit)
        {
            _context.Credits.Update(credit);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var credit = await _context.Credits.FindAsync(id);
            if (credit != null)
            {
                _context.Credits.Remove(credit);
                await _context.SaveChangesAsync();
            }
        }
    }
}
