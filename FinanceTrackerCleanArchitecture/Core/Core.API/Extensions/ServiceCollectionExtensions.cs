using Users.Domain.Interfaces;
using Users.Application.Interfaces;
using Users.Application.Users.Commands.LoginUser;
using Users.Application.Users.Commands.RegisterUser;
using Users.Application.Users.Commands.DeleteUser;
using Users.Application.Users.Commands.ChangeEmail;
using Users.Application.Users.Commands.ChangePassword;
using Users.Application.Users.Queries.GetUserById;
using Users.Application.Profiles.Commands.CreateProfile;
using Users.Application.Profiles.Commands.DeleteProfile;
using Users.Application.Profiles.Commands.RenameProfile;
using Users.Application.Profiles.Commands.ToggleProfileActive;
using Users.Application.Profiles.Queries.GetProfileById;
using Users.Application.Profiles.Queries.GetProfilesByUserId;
using Users.Infrastructure.Persistence;
using Users.Infrastructure.Persistence.Repositories;
using Users.Infrastructure.Services;
using Finance.Domain.Interfaces;
using Finance.Application.Currencies.Queries.GetAllCurrencies;
using Finance.Application.Currencies.Queries.GetCurrencyById;
using Finance.Application.Currencies.Commands.UpdateCurrencyRate;
using Finance.Application.Wallets.Commands.ChangeCurrency;
using Finance.Application.Wallets.Commands.ChangeIcon;
using Finance.Application.Wallets.Commands.ChangeNote;
using Finance.Application.Wallets.Commands.ChangeSortOrder;
using Finance.Application.Wallets.Commands.CreateWallet;
using Finance.Application.Wallets.Commands.DeleteWallet;
using Finance.Application.Wallets.Commands.RenameWallet;
using Finance.Application.Wallets.Queries.GetWalletById;
using Finance.Application.Wallets.Queries.GetWalletsByProfileId;
using Finance.Application.Units.Commands.CreateUnit;
using Finance.Application.Units.Commands.DeleteUnit;
using Finance.Application.Units.Commands.RenameUnit;
using Finance.Application.Units.Queries.GetAllUnits;
using Finance.Application.Units.Queries.GetUnitsByProfileId;
using Finance.Application.Credits.Commands.CreateCredit;
using Finance.Application.Credits.Commands.DeleteCredit;
using Finance.Application.Credits.Commands.RenameCredit;
using Finance.Application.Credits.Commands.MakePayment;
using Finance.Application.Credits.Commands.CloseCredit;
using Finance.Application.Credits.Queries.GetCreditById;
using Finance.Application.Credits.Queries.GetCreditsByProfileId;
using Finance.Application.Debts.Commands.CreateDebt;
using Finance.Application.Debts.Commands.DeleteDebt;
using Finance.Application.Debts.Commands.RenameCreditor;
using Finance.Application.Debts.Commands.MakePayment;
using Finance.Application.Debts.Commands.ChangeDueDate;
using Finance.Application.Debts.Commands.RepayDebt;
using Finance.Application.Debts.Queries.GetDebtById;
using Finance.Application.Debts.Queries.GetDebtsByProfileId;
using Finance.Application.Deposits.Commands.CreateDeposit;
using Finance.Application.Deposits.Commands.DeleteDeposit;
using Finance.Application.Deposits.Commands.RenameDeposit;
using Finance.Application.Deposits.Commands.TopUpDeposit;
using Finance.Application.Deposits.Commands.CloseDeposit;
using Finance.Application.Deposits.Queries.GetDepositById;
using Finance.Application.Deposits.Queries.GetDepositsByProfileId;
using Finance.Application.Categories.Commands.CreateCategory;
using Finance.Application.Categories.Commands.CreateSystemCategory;
using Finance.Application.Categories.Commands.DeleteCategory;
using Finance.Application.Categories.Commands.RenameCategory;
using Finance.Application.Categories.Commands.ChangeIcon;
using Finance.Application.Categories.Queries.GetCategoryById;
using Finance.Application.Categories.Queries.GetCategoriesByProfileId;
using Finance.Application.Categories.Queries.GetSystemCategories;
using Finance.Application.Transactions.Commands.CreateTransaction;
using Finance.Application.Transactions.Commands.DeleteTransaction;
using Finance.Application.Transactions.Commands.ChangeDescription;
using Finance.Application.Transactions.Commands.ChangeCategory;
using Finance.Application.Transactions.Queries.GetTransactionById;
using Finance.Application.Transactions.Queries.GetTransactionsByWalletId;
using Finance.Application.Transactions.Queries.GetWalletBalance;
using Finance.Application.RecurringTransactions.Commands.CreateRecurringTransaction;
using Finance.Application.RecurringTransactions.Commands.DeleteRecurringTransaction;
using Finance.Application.RecurringTransactions.Commands.DeactivateRecurringTransaction;
using Finance.Application.RecurringTransactions.Queries.GetRecurringTransactionById;
using Finance.Application.RecurringTransactions.Queries.GetRecurringTransactionsByWalletId;
using Finance.Infrastructure.Persistence;
using Finance.Infrastructure.Persistence.Repositories;
using Reports.Application.Reports.Commands.CreateReport;
using Reports.Application.Reports.Queries.GetReportStatus;
using Reports.Application.Reports.Queries.GetReportDownloadUrl;
using Microsoft.EntityFrameworkCore;

namespace Core.API.Extensions;

public static class ServiceCollectionExtensions
{
  public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
  {
    var connectionString = configuration.GetConnectionString("DefaultConnection");

    services.AddDbContext<UserDbContext>(options => options.UseNpgsql(connectionString));
    services.AddDbContext<FinanceDbContext>(options => options.UseNpgsql(connectionString));

    // User repositories
    services.AddScoped<IUserRepository, UserRepository>();
    services.AddScoped<IProfileRepository, ProfileRepository>();

    // Finance repositories
    services.AddScoped<IWalletRepository, WalletRepository>();
    services.AddScoped<ICurrencyRepository, CurrencyRepository>();
    services.AddScoped<IUnitRepository, UnitRepository>();
    services.AddScoped<ICreditRepository, CreditRepository>();
    services.AddScoped<IDebtRepository, DebtRepository>();
    services.AddScoped<IDepositRepository, DepositRepository>();
    services.AddScoped<ICategoryRepository, CategoryRepository>();
    services.AddScoped<ITransactionRepository, TransactionRepository>();
    services.AddScoped<IRecurringTransactionRepository, RecurringTransactionRepository>();

    // Cross-module services
    services.AddScoped<IProfileChecker, ProfileChecker>();

    // User services
    services.AddScoped<IPasswordHasher, PasswordHasher>();
    services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

    return services;
  }

  public static IServiceCollection AddApplication(this IServiceCollection services)
  {
    // User application
    services.AddScoped<RegisterUserCommandHandler>();
    services.AddScoped<LoginUserCommandHandler>();
    services.AddScoped<DeleteUserCommandHandler>();
    services.AddScoped<ChangeEmailCommandHandler>();
    services.AddScoped<ChangePasswordCommandHandler>();
    services.AddScoped<GetUserByIdQueryHandler>();
    services.AddScoped<CreateProfileCommandHandler>();
    services.AddScoped<DeleteProfileCommandHandler>();
    services.AddScoped<RenameProfileCommandHandler>();
    services.AddScoped<ToggleProfileActiveCommandHandler>();
    services.AddScoped<GetProfileByIdQueryHandler>();
    services.AddScoped<GetProfilesByUserIdQueryHandler>();

    // Finance application
    services.AddScoped<GetAllCurrenciesQueryHandler>();
    services.AddScoped<GetCurrencyByIdQueryHandler>();
    services.AddScoped<UpdateCurrencyRateCommandHandler>();
    services.AddScoped<CreateWalletCommandHandler>();
    services.AddScoped<DeleteWalletCommandHandler>();
    services.AddScoped<RenameWalletCommandHandler>();
    services.AddScoped<ChangeSortOrderCommandHandler>();
    services.AddScoped<ChangeIconCommandHandler>();
    services.AddScoped<ChangeCurrencyCommandHandler>();
    services.AddScoped<ChangeNoteCommandHandler>();
    services.AddScoped<GetWalletByIdQueryHandler>();
    services.AddScoped<GetWalletsByProfileIdQueryHandler>();
    services.AddScoped<CreateUnitCommandHandler>();
    services.AddScoped<DeleteUnitCommandHandler>();
    services.AddScoped<RenameUnitCommandHandler>();
    services.AddScoped<GetAllUnitsQueryHandler>();
    services.AddScoped<GetUnitsByProfileIdQueryHandler>();
    services.AddScoped<CreateCreditCommandHandler>();
    services.AddScoped<DeleteCreditCommandHandler>();
    services.AddScoped<RenameCreditCommandHandler>();
    services.AddScoped<MakePaymentCommandHandler>();
    services.AddScoped<CloseCreditCommandHandler>();
    services.AddScoped<GetCreditByIdQueryHandler>();
    services.AddScoped<GetCreditsByProfileIdQueryHandler>();
    services.AddScoped<CreateDebtCommandHandler>();
    services.AddScoped<DeleteDebtCommandHandler>();
    services.AddScoped<RenameCreditorCommandHandler>();
    services.AddScoped<MakeDebtPaymentCommandHandler>();
    services.AddScoped<ChangeDueDateCommandHandler>();
    services.AddScoped<RepayDebtCommandHandler>();
    services.AddScoped<GetDebtByIdQueryHandler>();
    services.AddScoped<GetDebtsByProfileIdQueryHandler>();
    services.AddScoped<CreateDepositCommandHandler>();
    services.AddScoped<DeleteDepositCommandHandler>();
    services.AddScoped<RenameDepositCommandHandler>();
    services.AddScoped<TopUpDepositCommandHandler>();
    services.AddScoped<CloseDepositCommandHandler>();
    services.AddScoped<GetDepositByIdQueryHandler>();
    services.AddScoped<GetDepositsByProfileIdQueryHandler>();
    services.AddScoped<CreateCategoryCommandHandler>();
    services.AddScoped<CreateSystemCategoryCommandHandler>();
    services.AddScoped<DeleteCategoryCommandHandler>();
    services.AddScoped<RenameCategoryCommandHandler>();
    services.AddScoped<ChangeIconCategoryCommandHandler>();
    services.AddScoped<GetCategoryByIdQueryHandler>();
    services.AddScoped<GetCategoriesByProfileIdQueryHandler>();
    services.AddScoped<GetSystemCategoriesQueryHandler>();
    services.AddScoped<CreateTransactionCommandHandler>();
    services.AddScoped<DeleteTransactionCommandHandler>();
    services.AddScoped<ChangeDescriptionCommandHandler>();
    services.AddScoped<ChangeCategoryTransactionCommandHandler>();
    services.AddScoped<GetTransactionByIdQueryHandler>();
    services.AddScoped<GetTransactionsByWalletIdQueryHandler>();
    services.AddScoped<GetWalletBalanceQueryHandler>();
    services.AddScoped<CreateRecurringTransactionCommandHandler>();
    services.AddScoped<DeleteRecurringTransactionCommandHandler>();
    services.AddScoped<DeactivateRecurringTransactionCommandHandler>();
    services.AddScoped<GetRecurringTransactionByIdQueryHandler>();
    services.AddScoped<GetRecurringTransactionsByWalletIdQueryHandler>();

    // Reports application
    services.AddScoped<CreateReportCommandHandler>();
    services.AddScoped<GetReportStatusQueryHandler>();
    services.AddScoped<GetReportDownloadUrlQueryHandler>();

    return services;
  }
}
