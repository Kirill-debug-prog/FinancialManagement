using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Wallets.Commands.DeleteWallet;

public record DeleteWalletCommand(Guid Id) : IRequest<Result<bool>>;
