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
            // Check if the request has authorization header
            string authHeader = context.Request.Headers["Authorization"];
            
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
            {
                string token = authHeader.Substring("Bearer ".Length);
                
                try
                {
                    // Verify the token with Firebase Admin SDK
                    FirebaseToken decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
                    
                    // Create claims identity
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.NameIdentifier, decodedToken.Uid),
                        new Claim(ClaimTypes.Email, decodedToken.Claims.TryGetValue("email", out var email) ? email.ToString() : ""),
                        new Claim("firebase_uid", decodedToken.Uid)
                    };
                    
                    // Set the user on the HttpContext
                    context.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Firebase"));
                }
                catch (Exception ex)
                {
                    // Token validation failed - don't set user
                    // You might want to log this exception
                    Console.WriteLine($"Firebase token validation failed: {ex.Message}");
                }
            }
            
            // Continue processing the request
            await _next(context);
        }
    }
    
    // Extension method to add this middleware to the request pipeline
    public static class FirebaseAuthMiddlewareExtensions
    {
        public static IApplicationBuilder UseFirebaseAuth(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<FirebaseAuthMiddleware>();
        }
    }
}