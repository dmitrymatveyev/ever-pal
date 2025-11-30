namespace EverPal.WebApi.Models
{
    public class User
    {
        public Guid Id { get; set; }

        // Basic user info
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }

        // Authentication
        public string? FirebaseUid { get; set; }
        public string? AnonymousToken { get; set; }

        // Trial and payment fields
        public DateTime? TrialStartedAt { get; set; }
        public DateTime? TrialEndsAt { get; set; }
        public bool IsPaid { get; set; } = false;
        public DateTime? PaymentDate { get; set; }
        public string? StripeCustomerId { get; set; }
        public string? StripePaymentIntentId { get; set; }

        // Disclaimer
        public bool DisclaimerAcknowledged { get; set; } = false;
        public DateTime? DisclaimerAcknowledgedAt { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
