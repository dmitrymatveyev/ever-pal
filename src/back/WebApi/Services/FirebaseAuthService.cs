using System.Text.Json;
using EverPal.WebApi.Models;
using FirebaseAdmin.Auth;

namespace EverPal.WebApi.Services
{
    public class FirebaseAuthService : IFirebaseAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly string _firebaseApiKey;

        public FirebaseAuthService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _firebaseApiKey = Environment.GetEnvironmentVariable("FIREBASE_API_KEY") 
                ?? throw new InvalidOperationException("FIREBASE_API_KEY environment variable is not set");
        }

        public async Task<AuthResponse> SignUpAsync(SignUpRequest request)
        {
            var signUpEndpoint = $"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={_firebaseApiKey}";
            var content = JsonContent.Create(new
            {
                email = request.Email,
                password = request.Password,
                returnSecureToken = true
            });

            var response = await _httpClient.PostAsync(signUpEndpoint, content);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadFromJsonAsync<JsonElement>();

            // After signup, update the user profile to add display name
            if (!string.IsNullOrEmpty(request.DisplayName))
            {
                await UpdateUserProfile(
                    responseContent.GetProperty("idToken").GetString(), 
                    request.DisplayName);
            }

            return new AuthResponse
            {
                Token = responseContent.GetProperty("idToken").GetString(),
                RefreshToken = responseContent.GetProperty("refreshToken").GetString(),
                UserId = responseContent.GetProperty("localId").GetString(),
                Email = request.Email,
                DisplayName = request.DisplayName
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var signInEndpoint = $"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={_firebaseApiKey}";
            var content = JsonContent.Create(new
            {
                email = request.Email,
                password = request.Password,
                returnSecureToken = true
            });

            var response = await _httpClient.PostAsync(signInEndpoint, content);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadFromJsonAsync<JsonElement>();

            // Get additional user info
            var userRecord = await FirebaseAuth.DefaultInstance.GetUserByEmailAsync(request.Email);

            return new AuthResponse
            {
                Token = responseContent.GetProperty("idToken").GetString(),
                RefreshToken = responseContent.GetProperty("refreshToken").GetString(),
                UserId = responseContent.GetProperty("localId").GetString(),
                Email = request.Email,
                DisplayName = userRecord.DisplayName
            };
        }

        private async Task UpdateUserProfile(string idToken, string displayName)
        {
            var updateProfileEndpoint = $"https://identitytoolkit.googleapis.com/v1/accounts:update?key={_firebaseApiKey}";
            var content = JsonContent.Create(new
            {
                idToken = idToken,
                displayName = displayName,
                returnSecureToken = true
            });

            var response = await _httpClient.PostAsync(updateProfileEndpoint, content);
            response.EnsureSuccessStatusCode();
        }
    }
}