using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FInanceTracker.Repositories
{
    public class CurrencyRepository : ICurrencyRepository
    {
        private readonly AppDbContext _context;

        public CurrencyRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Currency?> GetByIdAsync(Guid id)
        {
            return await _context.Currencies.FindAsync(id);
        }

        public async Task<List<Currency>> GetAllByProfileIdAsync(Guid profileId)
        {
            return await _context.Currencies
                .Where(c => c.ProfileId == profileId)
                .OrderBy(c => c.SortOrder)
                .ToListAsync();
        }

        public async Task<Currency> CreateAsync(Currency currency)
        {
            _context.Currencies.Add(currency);
            await _context.SaveChangesAsync();
            return currency;
        }

        public async Task UpdateAsync(Currency currency)
        {
            _context.Currencies.Update(currency);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var currency = await _context.Currencies.FindAsync(id);
            if (currency != null)
            {
                _context.Currencies.Remove(currency);
                await _context.SaveChangesAsync();
            }
        }
    }
}
