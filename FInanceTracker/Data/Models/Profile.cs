namespace FInanceTracker.Data.Models
{
    public class Profile
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string MainCurrency { get; set; } = "RUB";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
        public ICollection<Currency> Currencies { get; set; } = new List<Currency>();
        public ICollection<Account> Accounts { get; set; } = new List<Account>();
        public ICollection<Category> Categories { get; set; } = new List<Category>();
        public ICollection<UnitOfMeasure> UnitsOfMeasure { get; set; } = new List<UnitOfMeasure>();
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
        public ICollection<Credit> Credits { get; set; } = new List<Credit>();
        public ICollection<Debt> Debts { get; set; } = new List<Debt>();
        public ICollection<Deposit> Deposits { get; set; } = new List<Deposit>();
    }
}
