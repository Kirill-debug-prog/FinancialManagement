namespace Reports.Infrastructure.Generators;

public class CategoryBreakdownParameters
{
  public Guid ProfileId { get; set; }
  public DateOnly From { get; set; }
  public DateOnly To { get; set; }
}
