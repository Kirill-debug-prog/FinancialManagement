using FInanceTracker.Data.Models;
using FInanceTracker.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FInanceTracker.Repositories
{
    public class ProfileRepository : IProfileRepository
    {
        private readonly AppDbContext _context;

        public ProfileRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Profile?> GetByIdAsync(Guid id)
        {
            return await _context.Profiles.FindAsync(id);
        }

        public async Task<List<Profile>> GetAllByUserIdAsync(Guid userId)
        {
            return await _context.Profiles
                .Where(p => p.UserId == userId)
                .OrderBy(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> CountByUserIdAsync(Guid userId)
        {
            return await _context.Profiles.CountAsync(p => p.UserId == userId);
        }

        public async Task<Profile> CreateAsync(Profile profile)
        {
            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();
            return profile;
        }

        public async Task UpdateAsync(Profile profile)
        {
            _context.Profiles.Update(profile);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var profile = await _context.Profiles.FindAsync(id);
            if (profile != null)
            {
                _context.Profiles.Remove(profile);
                await _context.SaveChangesAsync();
            }
        }
    }
}
