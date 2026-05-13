using Finance.Domain.Entities;

namespace Finance.Domain.Interfaces;

public interface IDebtRepository
{
  Task CreateAsync(Debt debt);
  Task<Debt?> GetByIdAsync(Guid id);
  Task<IEnumerable<Debt>> GetByProfileIdAsync(Guid profileId);
  Task UpdateAsync(Debt debt);
  Task DeleteAsync(Debt debt);
}
