using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FInanceTracker.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly AppDbContext _context;

        public CategoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Category?> GetByIdAsync(Guid id)
        {
            return await _context.Categories
                .Include(c => c.Subcategories)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<List<Category>> GetAllByProfileIdAsync(Guid profileId, CategoryType? type = null)
        {
            var query = _context.Categories
                .Include(c => c.Subcategories)
                .Where(c => c.ProfileId == profileId && c.ParentId == null);

            if (type.HasValue)
                query = query.Where(c => c.Type == type.Value);

            return await query.OrderBy(c => c.SortOrder).ToListAsync();
        }

        public async Task<bool> HasTransactionsAsync(Guid categoryId)
        {
            return await _context.Transactions.AnyAsync(t => t.CategoryId == categoryId);
        }

        public async Task<Category> CreateAsync(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task UpdateAsync(Category category)
        {
            _context.Categories.Update(category);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category != null)
            {
                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();
            }
        }
    }
}
