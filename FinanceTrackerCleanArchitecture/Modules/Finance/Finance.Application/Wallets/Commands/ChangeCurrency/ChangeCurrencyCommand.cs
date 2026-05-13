namespace Finance.Application.Wallets.Commands.ChangeCurrency;

public record ChangeCurrencyCommand(Guid Id, Guid NewCurrencyId);
