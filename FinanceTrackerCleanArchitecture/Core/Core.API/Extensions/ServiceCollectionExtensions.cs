using Finance.Application.Wallets.Commands.CreateWallet;
using MediatR;
using Reports.Application.Reports.Commands.CreateReport;
using Users.Application.Users.Commands.RegisterUser;

namespace Core.API.Extensions;

public static class ServiceCollectionExtensions
{
  public static IServiceCollection AddApplication(this IServiceCollection services)
  {
    services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(
      typeof(RegisterUserCommand).Assembly,
      typeof(CreateWalletCommand).Assembly,
      typeof(CreateReportCommand).Assembly));

    return services;
  }
}
