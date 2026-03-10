using FInanceTracker.Data.DTOs;

namespace FInanceTracker.Services.Interfaces
{
    public interface IDepositService
    {
        Task<List<DepositDto>> GetAllByProfileIdAsync(Guid profileId, Guid userId);
        Task<DepositDto> GetByIdAsync(Guid id, Guid profileId, Guid userId);
        Task<DepositDto> CreateAsync(Guid profileId, Guid userId, CreateDepositDto dto);
        Task<DepositDto> UpdateAsync(Guid id, Guid profileId, Guid userId, UpdateDepositDto dto);
        Task DeleteAsync(Guid id, Guid profileId, Guid userId);
    }
}
