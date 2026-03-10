using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FInanceTracker.Repositories
{
    public class UnitOfMeasureRepository : IUnitOfMeasureRepository
    {
        private readonly AppDbContext _context;

        public UnitOfMeasureRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UnitOfMeasure?> GetByIdAsync(Guid id)
        {
            return await _context.UnitsOfMeasure.FindAsync(id);
        }

        public async Task<List<UnitOfMeasure>> GetAllByProfileIdAsync(Guid profileId)
        {
            return await _context.UnitsOfMeasure
                .Where(u => u.ProfileId == profileId)
                .OrderBy(u => u.Name)
                .ToListAsync();
        }

        public async Task<bool> HasTransactionsAsync(Guid unitId)
        {
            return await _context.Transactions.AnyAsync(t => t.UnitOfMeasureId == unitId);
        }

        public async Task<UnitOfMeasure> CreateAsync(UnitOfMeasure unit)
        {
            _context.UnitsOfMeasure.Add(unit);
            await _context.SaveChangesAsync();
            return unit;
        }

        public async Task UpdateAsync(UnitOfMeasure unit)
        {
            _context.UnitsOfMeasure.Update(unit);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var unit = await _context.UnitsOfMeasure.FindAsync(id);
            if (unit != null)
            {
                _context.UnitsOfMeasure.Remove(unit);
                await _context.SaveChangesAsync();
            }
        }
    }
}
