using System.Security.Claims;
using FirebaseAdmin.Auth;

namespace EverPal.WebApi.Middlewares
{
    public class FirebaseAuthMiddleware
    {
        private readonly RequestDelegate _next;

        public FirebaseAuthMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            string authHeader = context.Request.Headers["Authorization"];
            
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader.Substring("Bearer ".Length);
                
                try
                {
                    var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
                    
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.NameIdentifier, decodedToken.Uid),
                        new Claim(ClaimTypes.Email, decodedToken.Claims.TryGetValue("email", out var email) ? email.ToString() : ""),
                        new Claim("firebase_uid", decodedToken.Uid)
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