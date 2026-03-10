using FInanceTracker.Data.DTOs;

namespace FInanceTracker.Services.Interfaces
{
    public interface IProfileService
    {
        Task<List<ProfileDto>> GetAllByUserIdAsync(Guid userId);
        Task<ProfileDto> GetByIdAsync(Guid id, Guid userId);
        Task<ProfileDto> CreateAsync(Guid userId, CreateProfileDto dto);
        Task<ProfileDto> UpdateAsync(Guid id, Guid userId, UpdateProfileDto dto);
        Task DeleteAsync(Guid id, Guid userId);
    }
}
