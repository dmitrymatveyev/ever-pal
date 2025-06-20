using System.Security.Claims;
using EverPal.WebApi.Services;
using Dapper;
using Npgsql;

namespace EverPal.WebApi.Middlewares
{
    public class AnonymousAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IAnonymousAuthService _anonymousAuthService;
        private readonly IConfiguration _configuration;

        public AnonymousAuthMiddleware(RequestDelegate next, IAnonymousAuthService anonymousAuthService, IConfiguration configuration)
        {
            _next = next;
            _anonymousAuthService = anonymousAuthService;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                await _next(context);
                return;
            }

            string? authHeader = context.Request.Headers["Authorization"];
            
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Anonymous "))
            {
                var token = authHeader.Substring("Anonymous ".Length);
                
                if (await _anonymousAuthService.ValidateAnonymousTokenAsync(token))
                {
                    // Get database user ID
                    using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                    await connection.OpenAsync();
                    var userId = await connection.QuerySingleAsync<Guid>(
                        "SELECT id FROM users WHERE anonymous_token = @Token", 
                        new { Token = token });
                    
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                        new Claim("anonymous_token", token),
                        new Claim("user_id", userId.ToString())
                    };
                    
                    context.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Anonymous"));
                }
            }
            
            await _next(context);
        }
    }
    
    public static class AnonymousAuthMiddlewareExtensions
    {
        public static IApplicationBuilder UseAnonymousAuth(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<AnonymousAuthMiddleware>();
        }
    }
}
