using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Debts.Commands.MakePayment;

public record MakeDebtPaymentCommand(Guid DebtId, decimal Amount) : IRequest<Result<bool>>;
