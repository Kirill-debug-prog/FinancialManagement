using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Deposits.Commands.TopUpDeposit;

public record TopUpDepositCommand(Guid DepositId, decimal Amount) : IRequest<Result<bool>>;
