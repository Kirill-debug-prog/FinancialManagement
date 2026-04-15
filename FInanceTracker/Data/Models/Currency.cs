namespace FInanceTracker.Data.Models
{
    public class Currency
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProfileId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string ShortName { get; set; } = string.Empty;
        public int DecimalPlaces { get; set; } = 2;
        public int RateDecimalPlaces { get; set; } = 4;
        public int SortOrder { get; set; }

        public Profile Profile { get; set; } = null!;
        public ICollection<Account> Accounts { get; set; } = new List<Account>();
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}
