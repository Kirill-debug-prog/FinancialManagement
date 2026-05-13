using Finance.Domain.Entities;
using Finance.Domain.Interfaces;
using Finance.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Finance.Infrastructure.Persistence.Repositories;

public class CategoryRepository : ICategoryRepository
{
  private readonly FinanceDbContext _context;

  public CategoryRepository(FinanceDbContext context)
  {
    _context = context;
  }

  public async Task CreateAsync(Category category)
  {
    _context.Categories.Add(category);
    await _context.SaveChangesAsync();
  }

  public async Task<Category?> GetByIdAsync(Guid id)
  {
    return await _context.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
  }

  public async Task<IEnumerable<Category>> GetByProfileIdAsync(Guid profileId)
  {
    return await _context.Categories.AsNoTracking().Where(c => c.ProfileId == profileId).ToListAsync();
  }

  public async Task<IEnumerable<Category>> GetSystemCategoriesAsync()
  {
    return await _context.Categories.AsNoTracking().Where(c => c.IsSystem).ToListAsync();
  }

  public async Task UpdateAsync(Category category)
  {
    await _context.Categories
      .Where(c => c.Id == category.Id)
      .ExecuteUpdateAsync(s => s
        .SetProperty(c => c.Name, category.Name)
        .SetProperty(c => c.Icon, category.Icon)
        .SetProperty(c => c.UpdatedAt, DateTime.UtcNow));
  }

  public async Task DeleteAsync(Category category)
  {
    _context.Categories.Remove(category);
    await _context.SaveChangesAsync();
  }
}
