using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FInanceTracker.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly AppDbContext _context;

        public AccountRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Account?> GetByIdAsync(Guid id)
        {
            return await _context.Accounts
                .Include(a => a.Currency)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<List<Account>> GetAllByProfileIdAsync(Guid profileId)
        {
            return await _context.Accounts
                .Include(a => a.Currency)
                .Where(a => a.ProfileId == profileId)
                .OrderBy(a => a.SortOrder)
                .ToListAsync();
        }

        public async Task<Account> CreateAsync(Account account)
        {
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task UpdateAsync(Account account)
        {
            _context.Accounts.Update(account);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account != null)
            {
                _context.Accounts.Remove(account);
                await _context.SaveChangesAsync();
            }
        }
    }
}
