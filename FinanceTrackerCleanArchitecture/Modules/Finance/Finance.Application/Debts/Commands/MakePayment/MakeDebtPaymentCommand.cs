namespace Finance.Application.Debts.Commands.MakePayment;

public record MakeDebtPaymentCommand(Guid DebtId, decimal Amount);
