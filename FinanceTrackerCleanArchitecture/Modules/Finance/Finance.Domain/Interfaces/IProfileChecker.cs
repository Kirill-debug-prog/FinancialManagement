namespace Finance.Domain.Interfaces;

public interface IProfileChecker
{
  Task<bool> ExistsAsync(Guid profileId);
}
