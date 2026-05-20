using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Deposits.Commands.RenameDeposit;

public record RenameDepositCommand(Guid Id, string NewName) : IRequest<Result<bool>>;
