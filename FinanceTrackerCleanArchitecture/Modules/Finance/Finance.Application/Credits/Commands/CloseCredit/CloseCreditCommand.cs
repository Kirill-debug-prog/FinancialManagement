using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Credits.Commands.CloseCredit;

public record CloseCreditCommand(Guid Id) : IRequest<Result<bool>>;
