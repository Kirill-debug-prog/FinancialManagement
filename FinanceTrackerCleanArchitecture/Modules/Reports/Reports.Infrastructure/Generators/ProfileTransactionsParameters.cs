namespace Reports.Infrastructure.Generators;

public class ProfileTransactionsParameters
{
  public Guid ProfileId { get; set; }
  public DateOnly From { get; set; }
  public DateOnly To { get; set; }
}