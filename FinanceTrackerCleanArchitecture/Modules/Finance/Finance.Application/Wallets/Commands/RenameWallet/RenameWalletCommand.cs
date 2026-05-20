using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Wallets.Commands.RenameWallet;

public record RenameWalletCommand(Guid Id, string NewName) : IRequest<Result<bool>>;
