using System.Security.Claims;
using EverPal.WebApi.Services;

namespace EverPal.WebApi.Middlewares
{
    public class AnonymousAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IAnonymousAuthService _anonymousAuthService;

        public AnonymousAuthMiddleware(RequestDelegate next, IAnonymousAuthService anonymousAuthService)
        {
            _next = next;
            _anonymousAuthService = anonymousAuthService;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                await _next(context);
                return;
            }

            string authHeader = context.Request.Headers["Authorization"];
            
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Anonymous "))
            {
                var token = authHeader.Substring("Anonymous ".Length);
                
                if (await _anonymousAuthService.ValidateAnonymousTokenAsync(token))
                {
                    var claims = new List<Claim>
                    {
                        new Claim("anonymous_token", token)
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
