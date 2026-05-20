using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Credits.Commands.DeleteCredit;

public record DeleteCreditCommand(Guid Id) : IRequest<Result<bool>>;
