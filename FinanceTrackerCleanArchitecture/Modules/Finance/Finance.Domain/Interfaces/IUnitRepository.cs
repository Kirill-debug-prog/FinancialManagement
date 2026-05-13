using Finance.Domain.Entities;

namespace Finance.Domain.Interfaces;

public interface IUnitRepository
{
  Task<Unit?> GetByIdAsync(Guid id);
  Task<IEnumerable<Unit>> GetAllAsync();
  Task<IEnumerable<Unit>> GetByProfileIdAsync(Guid profileId);
  Task AddAsync(Unit unit);
  Task UpdateAsync(Unit unit);
  Task DeleteAsync(Unit unit);
}
