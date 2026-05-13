using Microsoft.EntityFrameworkCore;
using Reports.Domain.Entities;
using Reports.Domain.Interfaces;

namespace Reports.Infrastructure.Persistence.Repositories;

public class ReportJobRepository : IReportJobRepository
{
  private readonly ReportsDbContext _context;

  public ReportJobRepository(ReportsDbContext context)
  {
    _context = context;
  }

  public async Task CreateAsync(ReportJob job, CancellationToken cancellationToken = default)
  {
    _context.ReportJobs.Add(job);
    await _context.SaveChangesAsync(cancellationToken);
  }

  public async Task<ReportJob?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
  {
    return await _context.ReportJobs
      .AsNoTracking()
      .FirstOrDefaultAsync(j => j.Id == id, cancellationToken);
  }

  public async Task UpdateAsync(ReportJob job, CancellationToken cancellationToken = default)
  {
    await _context.ReportJobs
      .Where(j => j.Id == job.Id)
      .ExecuteUpdateAsync(s => s
        .SetProperty(j => j.Status, job.Status)
        .SetProperty(j => j.CompletedAt, job.CompletedAt)
        .SetProperty(j => j.FileKey, job.FileKey)
        .SetProperty(j => j.Error, job.Error)
        .SetProperty(j => j.UpdatedAt, DateTime.UtcNow),
        cancellationToken);
  }
}