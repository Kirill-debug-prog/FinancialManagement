using Finance.Domain.Entities;
using Finance.Domain.Interfaces;
using Finance.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Finance.Infrastructure.ExternalRates;

public class CurrencyRateSyncJob
{
  private readonly ICbrCurrencyRateService _cbrService;
  private readonly FinanceDbContext _context;

  public CurrencyRateSyncJob(ICbrCurrencyRateService cbrService, FinanceDbContext context)
  {
    _cbrService = cbrService;
    _context = context;
  }

  public async Task ExecuteAsync()
  {
    IEnumerable<CbrCurrencyRate> rates;
    try
    {
      rates = await _cbrService.GetRatesAsync();
    }
    catch
    {
      return;
    }

    foreach (var rate in rates)
    {
      var existing = await _context.Currencies.FirstOrDefaultAsync(c => c.Code == rate.Code);
      if (existing is not null)
      {
        existing.UpdateRate(rate.Rate, rate.UnitRate);
      }
      else
      {
        var created = Currency.Create(rate.Name, rate.Nominal, rate.Rate, rate.NumericCode, rate.Code, rate.UnitRate);
        if (created.IsSuccess)
          _context.Currencies.Add(created.Value!);
      }
    }

    await _context.SaveChangesAsync();
  }
}
