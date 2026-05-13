namespace Finance.Application.Wallets.Commands.RenameWallet;

public record RenameWalletCommand(Guid Id, string NewName);
