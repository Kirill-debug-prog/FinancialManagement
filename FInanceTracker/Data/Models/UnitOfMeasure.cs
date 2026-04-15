namespace FInanceTracker.Data.Models
{
    public class UnitOfMeasure
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProfileId { get; set; }
        public string Name { get; set; } = string.Empty;

        public Profile Profile { get; set; } = null!;
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}
