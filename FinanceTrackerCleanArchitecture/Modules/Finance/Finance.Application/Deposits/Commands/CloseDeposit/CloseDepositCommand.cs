using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Deposits.Commands.CloseDeposit;

public record CloseDepositCommand(Guid Id) : IRequest<Result<bool>>;
