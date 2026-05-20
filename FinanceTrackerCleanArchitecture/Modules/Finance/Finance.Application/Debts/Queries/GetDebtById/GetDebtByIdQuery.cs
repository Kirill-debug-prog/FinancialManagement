using MediatR;
using Core.Domain.Common;
namespace Finance.Application.Debts.Queries.GetDebtById;

public record GetDebtByIdQuery(Guid Id) : IRequest<Result<GetDebtByIdResponse>>;
