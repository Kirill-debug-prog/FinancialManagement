using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Credits.Commands.MakePayment;

public record MakePaymentCommand(Guid CreditId, decimal Amount) : IRequest<Result<bool>>;
