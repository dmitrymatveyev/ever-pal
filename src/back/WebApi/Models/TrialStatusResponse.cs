namespace EverPal.WebApi.Models
{
    public class TrialStatusResponse
    {
        public bool TrialStarted { get; set; }
        public int DaysRemaining { get; set; }
        public bool IsTrialActive { get; set; }
        public bool IsPaid { get; set; }
    }
}
