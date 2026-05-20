using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Wallets.Commands.ChangeNote;

public record ChangeNoteCommand(Guid Id, string? NewNote) : IRequest<Result<bool>>;
