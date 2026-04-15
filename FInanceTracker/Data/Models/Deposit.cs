namespace FInanceTracker.Data.Models
{
    public class Deposit
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProfileId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Bank { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal InterestRate { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Type { get; set; } = "fixed"; // fixed, replenishable
        public bool Capitalization { get; set; }
        public string Status { get; set; } = "active"; // active, closed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Profile Profile { get; set; } = null!;
    }
}
