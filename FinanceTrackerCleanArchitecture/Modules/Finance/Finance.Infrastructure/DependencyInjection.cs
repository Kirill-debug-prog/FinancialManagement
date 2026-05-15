using Finance.Application.Analytics.Queries.GetCategoryAnalytics;
using Finance.Application.Analytics.Queries.GetMonthlyAnalytics;
using Finance.Application.Import;
using Finance.Domain.Interfaces;
using Finance.Infrastructure.BankParsers;
using Finance.Infrastructure.ExternalRates;
using Finance.Infrastructure.Persistence;
using Finance.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Finance.Infrastructure;

public static class DependencyInjection
{
  public static IServiceCollection AddFinanceModule(this IServiceCollection services, IConfiguration configuration)
  {
    services.AddDbContext<FinanceDbContext>(options =>
      options.UseNpgsql(
        configuration.GetConnectionString("DefaultConnection"),
        npgsql => npgsql.MigrationsHistoryTable("__EFMigrationsHistory", FinanceDbContext.Schema)));

    services.AddScoped<IWalletRepository, WalletRepository>();
    services.AddScoped<ICurrencyRepository, CurrencyRepository>();
    services.AddScoped<IUnitRepository, UnitRepository>();
    services.AddScoped<ICreditRepository, CreditRepository>();
    services.AddScoped<IDebtRepository, DebtRepository>();
    services.AddScoped<IDepositRepository, DepositRepository>();
    services.AddScoped<ICategoryRepository, CategoryRepository>();
    services.AddScoped<ITransactionRepository, TransactionRepository>();
    services.AddScoped<IRecurringTransactionRepository, RecurringTransactionRepository>();

    services.AddScoped<GetMonthlyAnalyticsQueryHandler>();
    services.AddScoped<GetCategoryAnalyticsQueryHandler>();

    services.AddScoped<IBankStatementParser, SberbankPdfParser>();

    services.AddHttpClient<ICbrCurrencyRateService, CbrCurrencyRateService>();
    services.AddScoped<CurrencyRateSyncJob>();

    return services;
  }
}
