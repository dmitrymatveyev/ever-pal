using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;
using EverPal.WebApi.Services;

namespace EverPal.WebApi.Controllers
{
    [ApiController]
    [Route("api/webhooks")]
    public class WebhooksController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IUserService _userService;
        private readonly ILogger<WebhooksController> _logger;

        public WebhooksController(
            IConfiguration configuration,
            IUserService userService,
            ILogger<WebhooksController> logger)
        {
            _configuration = configuration;
            _userService = userService;
            _logger = logger;
        }

        [HttpPost("stripe")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var stripeSignature = Request.Headers["Stripe-Signature"].ToString();
            var webhookSecret = _configuration["Stripe:WebhookSecret"];

            if (string.IsNullOrEmpty(webhookSecret))
            {
                _logger.LogError("Stripe webhook secret not configured");
                return StatusCode(500, "Webhook secret not configured");
            }

            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    stripeSignature,
                    webhookSecret
                );

                _logger.LogInformation("Stripe webhook received: {EventType} (ID: {EventId})",
                    stripeEvent.Type, stripeEvent.Id);

                if (stripeEvent.Type == "checkout.session.completed")
                {
                    var session = stripeEvent.Data.Object as Session;
                    if (session == null)
                    {
                        _logger.LogWarning("Checkout session is null for event {EventId}", stripeEvent.Id);
                        return BadRequest("Invalid session");
                    }

                    await HandleCheckoutSessionCompletedAsync(session);
                }
                else
                {
                    _logger.LogInformation("Unhandled webhook event type: {EventType}", stripeEvent.Type);
                }

                return Ok();
            }
            catch (StripeException e)
            {
                _logger.LogError("Stripe webhook error: {Message}", e.Message);
                return BadRequest(new { error = e.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Unexpected error processing webhook");
                return StatusCode(500, "Internal server error");
            }
        }

        private async Task HandleCheckoutSessionCompletedAsync(Session session)
        {
            try
            {
                var userId = session.ClientReferenceId;

                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("No ClientReferenceId (user_id) in session {SessionId}", session.Id);
                    return;
                }

                _logger.LogInformation("Processing payment for user {UserId} from session {SessionId}",
                    userId, session.Id);

                // Log what Stripe sent us
                _logger.LogDebug("Session details - PaymentIntentId: {PaymentIntentId}, CustomerId: {CustomerId}, CustomerEmail: {CustomerEmail}",
                    session.PaymentIntentId, session.CustomerId ?? "NULL", session.CustomerEmail ?? "NULL");

                // Validate payment amount (>= 7900 cents = $79, allows for tax)
                const long MINIMUM_AMOUNT = 7900;
                if (session.AmountTotal < MINIMUM_AMOUNT)
                {
                    _logger.LogWarning("Payment amount too low for session {SessionId}: minimum {MinimumAmount}, got {ActualAmount}",
                        session.Id, MINIMUM_AMOUNT, session.AmountTotal);
                    return; // Don't credit for insufficient amount
                }

                // Check if payment already processed (idempotency)
                var existingUser = await _userService.GetUserByStripePaymentIntentAsync(session.PaymentIntentId);
                if (existingUser != null && existingUser.IsPaid)
                {
                    _logger.LogInformation("Payment {PaymentIntentId} already processed for user {UserId}. Idempotent success.",
                        session.PaymentIntentId, existingUser.Id);
                    return; // Already processed - idempotent
                }

                var success = await _userService.MarkUserAsPaidAsync(
                    userId,
                    session.CustomerId,
                    session.PaymentIntentId
                );

                if (success)
                {
                    _logger.LogInformation("Successfully marked user {UserId} as paid via webhook", userId);
                }
                else
                {
                    _logger.LogError("Failed to mark user {UserId} as paid. User may not exist.", userId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling checkout session {SessionId}", session.Id);
                throw;
            }
        }
    }
}
