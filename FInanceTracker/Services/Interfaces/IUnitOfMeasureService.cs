using FInanceTracker.Data.DTOs;

namespace FInanceTracker.Services.Interfaces
{
    public interface IUnitOfMeasureService
    {
        Task<List<UnitDto>> GetAllByProfileIdAsync(Guid profileId, Guid userId);
        Task<UnitDto> GetByIdAsync(Guid id, Guid profileId, Guid userId);
        Task<UnitDto> CreateAsync(Guid profileId, Guid userId, CreateUnitDto dto);
        Task<UnitDto> UpdateAsync(Guid id, Guid profileId, Guid userId, CreateUnitDto dto);
        Task DeleteAsync(Guid id, Guid profileId, Guid userId);
    }
}
