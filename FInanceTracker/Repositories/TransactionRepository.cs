using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FInanceTracker.Repositories
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly AppDbContext _context;

        public TransactionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Transaction?> GetByIdAsync(Guid id)
        {
            return await _context.Transactions
                .Include(t => t.Account)
                .Include(t => t.Category)
                .Include(t => t.Currency)
                .Include(t => t.UnitOfMeasure)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<List<Transaction>> GetAllByProfileIdAsync(Guid profileId, Guid? accountId = null, Guid? categoryId = null, DateTime? dateFrom = null, DateTime? dateTo = null)
        {
            var query = _context.Transactions
                .Include(t => t.Account)
                .Include(t => t.Category)
                .Include(t => t.Currency)
                .Include(t => t.UnitOfMeasure)
                .Where(t => t.ProfileId == profileId);

            if (accountId.HasValue)
                query = query.Where(t => t.AccountId == accountId.Value);

            if (categoryId.HasValue)
                query = query.Where(t => t.CategoryId == categoryId.Value);

            if (dateFrom.HasValue)
                query = query.Where(t => t.Date >= dateFrom.Value);

            if (dateTo.HasValue)
                query = query.Where(t => t.Date <= dateTo.Value);

            return await query.OrderByDescending(t => t.Date).ThenByDescending(t => t.CreatedAt).ToListAsync();
        }

        public async Task<List<Transaction>> GetByAccountIdAsync(Guid accountId)
        {
            return await _context.Transactions
                .Where(t => t.AccountId == accountId)
                .ToListAsync();
        }

        public async Task<Transaction> CreateAsync(Transaction transaction)
        {
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task UpdateAsync(Transaction transaction)
        {
            _context.Transactions.Update(transaction);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction != null)
            {
                _context.Transactions.Remove(transaction);
                await _context.SaveChangesAsync();
            }
        }
    }
}
