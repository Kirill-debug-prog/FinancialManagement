using FInanceTracker.Data.DTOs;

namespace FInanceTracker.Services.Interfaces
{
    public interface ICreditService
    {
        Task<List<CreditDto>> GetAllByProfileIdAsync(Guid profileId, Guid userId);
        Task<CreditDto> GetByIdAsync(Guid id, Guid profileId, Guid userId);
        Task<CreditDto> CreateAsync(Guid profileId, Guid userId, CreateCreditDto dto);
        Task<CreditDto> UpdateAsync(Guid id, Guid profileId, Guid userId, UpdateCreditDto dto);
        Task DeleteAsync(Guid id, Guid profileId, Guid userId);
    }
}
