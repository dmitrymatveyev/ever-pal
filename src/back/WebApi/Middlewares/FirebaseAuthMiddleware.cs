using System.Security.Claims;
using FirebaseAdmin.Auth;
using Dapper;
using Npgsql;

namespace EverPal.WebApi.Middlewares
{
    public class FirebaseAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public FirebaseAuthMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            string? authHeader = context.Request.Headers["Authorization"];
            
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader.Substring("Bearer ".Length);
                
                try
                {
                    var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
                    
                    // Get database user ID
                    using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                    await connection.OpenAsync();
                    var userId = await connection.QuerySingleAsync<Guid>(
                        "SELECT id FROM users WHERE firebase_uid = @FirebaseUid", 
                        new { FirebaseUid = decodedToken.Uid });
                    
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                        new Claim(ClaimTypes.Email, decodedToken.Claims.TryGetValue("email", out var email) ? email.ToString() ?? "" : ""),
                        new Claim("firebase_uid", decodedToken.Uid),
                        new Claim("user_id", userId.ToString())
                    };
                    
                    context.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Firebase"));
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Firebase token validation failed: {ex.Message}");
                }
            }
            
            await _next(context);
        }
    }
    
    public static class FirebaseAuthMiddlewareExtensions
    {
        public static IApplicationBuilder UseFirebaseAuth(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<FirebaseAuthMiddleware>();
        }
    }
}