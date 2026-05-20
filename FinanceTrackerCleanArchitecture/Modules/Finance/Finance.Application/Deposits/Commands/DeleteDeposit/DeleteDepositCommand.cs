using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Deposits.Commands.DeleteDeposit;

public record DeleteDepositCommand(Guid Id) : IRequest<Result<bool>>;
