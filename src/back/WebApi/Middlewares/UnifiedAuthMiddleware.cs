using System.Security.Claims;
using EverPal.WebApi.Services;
using Dapper;
using Npgsql;

namespace EverPal.WebApi.Middlewares
{
    public class UnifiedAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public UnifiedAuthMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task InvokeAsync(
            HttpContext context,
            IAnonymousAuthService anonymousAuthService,
            IFirebaseAuthService firebaseAuthService,
            IUserService userService)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                await _next(context);
                return;
            }

            var authHeader = context.Request.Headers["Authorization"].ToString();

            if (string.IsNullOrEmpty(authHeader))
            {
                await _next(context);
                return;
            }

            if (authHeader.StartsWith("Anonymous "))
            {
                await HandleAnonymousAuth(context, authHeader, anonymousAuthService);
            }
            else if (authHeader.StartsWith("Bearer "))
            {
                await HandleBearerAuth(context, authHeader, firebaseAuthService, userService);
            }

            await _next(context);
        }

        private async Task HandleAnonymousAuth(
            HttpContext context,
            string authHeader,
            IAnonymousAuthService anonymousAuthService)
        {
            var token = authHeader.Substring("Anonymous ".Length);

            if (!await anonymousAuthService.ValidateAnonymousTokenAsync(token))
            {
                return;
            }

            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();

            var userId = await connection.QuerySingleOrDefaultAsync<Guid?>(
                "SELECT id FROM users WHERE anonymous_token = @Token",
                new { Token = token });

            if (userId == null)
            {
                return;
            }

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, userId.ToString()!),
                new("anonymous_token", token),
                new("user_id", userId.ToString()!),
                new("auth_type", "anonymous")
            };

            context.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Anonymous"));
        }

        private async Task HandleBearerAuth(
            HttpContext context,
            string authHeader,
            IFirebaseAuthService firebaseAuthService,
            IUserService userService)
        {
            var token = authHeader.Substring("Bearer ".Length);

            try
            {
                var firebaseToken = await firebaseAuthService.VerifyIdTokenAsync(token);
                var firebaseUid = firebaseToken.Uid;

                using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();

                var user = await connection.QuerySingleOrDefaultAsync<(Guid Id, string? Email, bool EmailVerified)>(
                    "SELECT id, email, email_verified FROM users WHERE firebase_uid = @FirebaseUid",
                    new { FirebaseUid = firebaseUid });

                if (user.Id == Guid.Empty)
                {
                    return;
                }

                var firebaseEmailVerified = firebaseToken.Claims.TryGetValue("email_verified", out var emailVerifiedClaim)
                    && emailVerifiedClaim is bool emailVerified
                    && emailVerified;

                if (firebaseEmailVerified && !user.EmailVerified)
                {
                    await userService.MarkEmailVerifiedAsync(user.Id);
                    user.EmailVerified = true;
                }

                var claims = new List<Claim>
                {
                    new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new("firebase_uid", firebaseUid),
                    new("user_id", user.Id.ToString()),
                    new("auth_type", "firebase")
                };

                if (!string.IsNullOrEmpty(user.Email))
                {
                    claims.Add(new Claim(ClaimTypes.Email, user.Email));
                }

                if (user.EmailVerified)
                {
                    claims.Add(new Claim("email_verified", "true"));
                }

                context.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Firebase"));
            }
            catch
            {
                // Invalid token - continue without authentication
            }
        }
    }
}
