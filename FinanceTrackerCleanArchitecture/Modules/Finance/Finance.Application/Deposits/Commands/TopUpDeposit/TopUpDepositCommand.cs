namespace Finance.Application.Deposits.Commands.TopUpDeposit;

public record TopUpDepositCommand(Guid DepositId, decimal Amount);
