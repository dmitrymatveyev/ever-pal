using Dapper;
using EverPal.WebApi.Models;
using Npgsql;

namespace EverPal.WebApi.Services
{
    public class UserService : IUserService
    {
        private readonly string _connectionString;
        private readonly ILogger<UserService> _logger;

        public UserService(IConfiguration configuration, ILogger<UserService> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Database connection string not configured");
            _logger = logger;
        }

        public async Task<User?> GetUserByIdAsync(string userId)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT
                    id,
                    email,
                    phone,
                    first_name as FirstName,
                    last_name as LastName,
                    firebase_uid as FirebaseUid,
                    anonymous_token as AnonymousToken,
                    email_verified as EmailVerified,
                    email_verified_at as EmailVerifiedAt,
                    email_verification_sent_at as EmailVerificationSentAt,
                    trial_started_at as TrialStartedAt,
                    trial_ends_at as TrialEndsAt,
                    is_paid as IsPaid,
                    payment_date as PaymentDate,
                    stripe_customer_id as StripeCustomerId,
                    stripe_payment_intent_id as StripePaymentIntentId,
                    disclaimer_acknowledged as DisclaimerAcknowledged,
                    disclaimer_acknowledged_at as DisclaimerAcknowledgedAt,
                    created_at as CreatedAt,
                    updated_at as UpdatedAt
                FROM users
                WHERE id = @UserId::uuid;";

            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { UserId = userId });
        }

        public async Task<User?> GetUserByStripePaymentIntentAsync(string? paymentIntentId)
        {
            if (string.IsNullOrEmpty(paymentIntentId))
            {
                return null;
            }

            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT
                    id,
                    email,
                    phone,
                    first_name as FirstName,
                    last_name as LastName,
                    firebase_uid as FirebaseUid,
                    anonymous_token as AnonymousToken,
                    email_verified as EmailVerified,
                    email_verified_at as EmailVerifiedAt,
                    email_verification_sent_at as EmailVerificationSentAt,
                    trial_started_at as TrialStartedAt,
                    trial_ends_at as TrialEndsAt,
                    is_paid as IsPaid,
                    payment_date as PaymentDate,
                    stripe_customer_id as StripeCustomerId,
                    stripe_payment_intent_id as StripePaymentIntentId,
                    disclaimer_acknowledged as DisclaimerAcknowledged,
                    disclaimer_acknowledged_at as DisclaimerAcknowledgedAt,
                    created_at as CreatedAt,
                    updated_at as UpdatedAt
                FROM users
                WHERE stripe_payment_intent_id = @PaymentIntentId
                LIMIT 1;";

            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { PaymentIntentId = paymentIntentId });
        }

        public async Task<bool> MarkUserAsPaidAsync(string userId, string? stripeCustomerId, string? stripePaymentIntentId)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            using var transaction = await connection.BeginTransactionAsync();

            try
            {
                var sql = @"
                    UPDATE users
                    SET is_paid = true,
                        payment_date = CURRENT_TIMESTAMP AT TIME ZONE 'UTC',
                        stripe_customer_id = @StripeCustomerId,
                        stripe_payment_intent_id = @StripePaymentIntentId,
                        updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
                    WHERE id = @UserId::uuid
                    RETURNING id;";

                var result = await connection.QueryFirstOrDefaultAsync<Guid?>(
                    sql,
                    new
                    {
                        UserId = userId,
                        StripeCustomerId = stripeCustomerId,
                        StripePaymentIntentId = stripePaymentIntentId
                    },
                    transaction: transaction
                );

                if (result.HasValue)
                {
                    await transaction.CommitAsync();
                    _logger.LogInformation("User {UserId} marked as paid. StripeCustomerId: {StripeCustomerId}",
                        userId, stripeCustomerId);
                    return true;
                }

                await transaction.RollbackAsync();
                _logger.LogWarning("Failed to mark user {UserId} as paid. User may not exist.", userId);
                return false;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error marking user {UserId} as paid. Transaction rolled back.", userId);
                throw;
            }
        }

        public async Task<bool> IsTrialActiveAsync(string userId)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT trial_ends_at, is_paid
                FROM users
                WHERE id = @UserId::uuid;";

            var user = await connection.QueryFirstOrDefaultAsync<dynamic>(sql, new { UserId = userId });

            if (user == null)
            {
                _logger.LogWarning("User {UserId} not found when checking trial status", userId);
                return false;
            }

            // If user has paid, they have access
            if (user.is_paid)
            {
                return true;
            }

            // Check if trial is still active (compare UTC times)
            // PostgreSQL TIMESTAMP WITH TIME ZONE returns DateTime in UTC
            var trialEndsAt = user.trial_ends_at as DateTime?;
            var isTrialActive = trialEndsAt != null && DateTime.UtcNow < trialEndsAt.Value;

            _logger.LogDebug("User {UserId} trial status: TrialEndsAt={TrialEndsAt}, IsActive={IsActive}",
                userId, trialEndsAt, isTrialActive);

            return isTrialActive;
        }

        public async Task<bool> HasPaidAccessAsync(string userId)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT is_paid FROM users WHERE id = @UserId::uuid;";

            var isPaid = await connection.QueryFirstOrDefaultAsync<bool?>(sql, new { UserId = userId });

            if (!isPaid.HasValue)
            {
                _logger.LogWarning("User {UserId} not found when checking paid status", userId);
                return false;
            }

            return isPaid.Value;
        }

        public async Task AcknowledgeDisclaimerAsync(string userId)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                UPDATE users
                SET disclaimer_acknowledged = true,
                    disclaimer_acknowledged_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC',
                    updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
                WHERE id = @UserId::uuid;";

            var rowsAffected = await connection.ExecuteAsync(sql, new { UserId = userId });

            if (rowsAffected > 0)
            {
                _logger.LogInformation("User {UserId} acknowledged disclaimer", userId);
            }
            else
            {
                _logger.LogWarning("Failed to acknowledge disclaimer for user {UserId}. User may not exist.", userId);
            }
        }

        public async Task<bool> StartTrialAsync(string userId)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                UPDATE users
                SET trial_started_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC',
                    trial_ends_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' + INTERVAL '7 days',
                    updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
                WHERE id = @UserId::uuid
                  AND trial_started_at IS NULL
                RETURNING id;";

            var result = await connection.QueryFirstOrDefaultAsync<Guid?>(sql, new { UserId = userId });

            if (result.HasValue)
            {
                _logger.LogInformation("Started 7-day trial for user {UserId}", userId);
                return true;
            }

            _logger.LogDebug("Trial not started for user {UserId}. Trial may already be active or user not found.", userId);
            return false;
        }

        public async Task<User?> GetUserByFirebaseUidAsync(string firebaseUid)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT
                    id,
                    email,
                    phone,
                    first_name as FirstName,
                    last_name as LastName,
                    firebase_uid as FirebaseUid,
                    anonymous_token as AnonymousToken,
                    email_verified as EmailVerified,
                    email_verified_at as EmailVerifiedAt,
                    email_verification_sent_at as EmailVerificationSentAt,
                    trial_started_at as TrialStartedAt,
                    trial_ends_at as TrialEndsAt,
                    is_paid as IsPaid,
                    payment_date as PaymentDate,
                    stripe_customer_id as StripeCustomerId,
                    stripe_payment_intent_id as StripePaymentIntentId,
                    disclaimer_acknowledged as DisclaimerAcknowledged,
                    disclaimer_acknowledged_at as DisclaimerAcknowledgedAt,
                    created_at as CreatedAt,
                    updated_at as UpdatedAt
                FROM users
                WHERE firebase_uid = @FirebaseUid;";

            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { FirebaseUid = firebaseUid });
        }

        public async Task<User?> GetUserByAnonymousTokenAsync(string anonymousToken)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT
                    id,
                    email,
                    phone,
                    first_name as FirstName,
                    last_name as LastName,
                    firebase_uid as FirebaseUid,
                    anonymous_token as AnonymousToken,
                    email_verified as EmailVerified,
                    email_verified_at as EmailVerifiedAt,
                    email_verification_sent_at as EmailVerificationSentAt,
                    trial_started_at as TrialStartedAt,
                    trial_ends_at as TrialEndsAt,
                    is_paid as IsPaid,
                    payment_date as PaymentDate,
                    stripe_customer_id as StripeCustomerId,
                    stripe_payment_intent_id as StripePaymentIntentId,
                    disclaimer_acknowledged as DisclaimerAcknowledged,
                    disclaimer_acknowledged_at as DisclaimerAcknowledgedAt,
                    created_at as CreatedAt,
                    updated_at as UpdatedAt
                FROM users
                WHERE anonymous_token = @AnonymousToken;";

            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { AnonymousToken = anonymousToken });
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                SELECT
                    id,
                    email,
                    phone,
                    first_name as FirstName,
                    last_name as LastName,
                    firebase_uid as FirebaseUid,
                    anonymous_token as AnonymousToken,
                    email_verified as EmailVerified,
                    email_verified_at as EmailVerifiedAt,
                    email_verification_sent_at as EmailVerificationSentAt,
                    trial_started_at as TrialStartedAt,
                    trial_ends_at as TrialEndsAt,
                    is_paid as IsPaid,
                    payment_date as PaymentDate,
                    stripe_customer_id as StripeCustomerId,
                    stripe_payment_intent_id as StripePaymentIntentId,
                    disclaimer_acknowledged as DisclaimerAcknowledged,
                    disclaimer_acknowledged_at as DisclaimerAcknowledgedAt,
                    created_at as CreatedAt,
                    updated_at as UpdatedAt
                FROM users
                WHERE email = @Email;";

            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
        }

        public async Task<bool> ConvertAnonymousToEmailAsync(Guid userId, string firebaseUid, string email)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            using var transaction = await connection.BeginTransactionAsync();

            try
            {
                var sql = @"
                    UPDATE users
                    SET firebase_uid = @FirebaseUid,
                        email = @Email,
                        email_verified = false,
                        updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
                    WHERE id = @UserId
                    RETURNING id;";

                var result = await connection.QueryFirstOrDefaultAsync<Guid?>(
                    sql,
                    new
                    {
                        UserId = userId,
                        FirebaseUid = firebaseUid,
                        Email = email
                    },
                    transaction: transaction
                );

                if (result.HasValue)
                {
                    await transaction.CommitAsync();
                    _logger.LogInformation(
                        "Converted anonymous user {UserId} to email account {Email} with Firebase UID {FirebaseUid}",
                        userId, email, firebaseUid);
                    return true;
                }

                await transaction.RollbackAsync();
                _logger.LogWarning("Failed to convert user {UserId}. User may not exist.", userId);
                return false;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error converting user {UserId} to email account. Transaction rolled back.", userId);
                throw;
            }
        }

        public async Task UpdateEmailVerificationSentAsync(Guid userId)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                UPDATE users
                SET email_verification_sent_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC',
                    updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
                WHERE id = @UserId;";

            var rowsAffected = await connection.ExecuteAsync(sql, new { UserId = userId });

            if (rowsAffected > 0)
            {
                _logger.LogInformation("Updated email verification sent timestamp for user {UserId}", userId);
            }
            else
            {
                _logger.LogWarning("Failed to update email verification sent for user {UserId}. User may not exist.", userId);
            }
        }

        public async Task MarkEmailVerifiedAsync(Guid userId)
        {
            using var connection = new NpgsqlConnection(_connectionString);

            var sql = @"
                UPDATE users
                SET email_verified = true,
                    email_verified_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC',
                    updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
                WHERE id = @UserId
                  AND email_verified = false;";

            var rowsAffected = await connection.ExecuteAsync(sql, new { UserId = userId });

            if (rowsAffected > 0)
            {
                _logger.LogInformation("Marked email as verified for user {UserId}", userId);
            }
        }
    }
}
