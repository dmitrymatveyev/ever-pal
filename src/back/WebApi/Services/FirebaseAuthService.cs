using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using EverPal.WebApi.Exceptions;
using EverPal.WebApi.Models;
using System.Text.Json;

namespace EverPal.WebApi.Services
{
    public class FirebaseAuthService : IFirebaseAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _frontendBaseUrl;
        private readonly FirebaseAuth _firebaseAuth;

        public FirebaseAuthService(
            HttpClient httpClient,
            IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["FIREBASE_API_KEY"]
                ?? throw new ArgumentNullException("FIREBASE_API_KEY environment variable is missing");
            _frontendBaseUrl = configuration["Frontend__BaseUrl"] ?? "http://localhost:5173";

            var app = CreateFirebaseApp(configuration);
            _firebaseAuth = FirebaseAuth.GetAuth(app);
        }

        private FirebaseApp CreateFirebaseApp(IConfiguration configuration)
        {
            var credentialsJson = configuration["FIREBASE_CREDENTIALS"]
                ?? throw new InvalidOperationException("FIREBASE_CREDENTIALS environment variable is not set");

            return FirebaseApp.Create(new AppOptions
            {
                Credential = GoogleCredential.FromJson(credentialsJson)
            }, "EverPalApp");
        }

        public async Task<UserRecord> CreateUserAsync(string email, string password)
        {
            var userArgs = new UserRecordArgs
            {
                Email = email,
                Password = password,
                EmailVerified = false
            };

            return await _firebaseAuth.CreateUserAsync(userArgs);
        }

        public async Task<string> GenerateEmailVerificationLinkAsync(string email)
        {
            var actionCodeSettings = new ActionCodeSettings
            {
                Url = _frontendBaseUrl,
                HandleCodeInApp = false
            };

            return await _firebaseAuth.GenerateEmailVerificationLinkAsync(email, actionCodeSettings);
        }

        public async Task<FirebaseToken> VerifyIdTokenAsync(string idToken)
        {
            return await _firebaseAuth.VerifyIdTokenAsync(idToken);
        }

        public async Task<string> CreateCustomTokenAsync(string uid)
        {
            return await _firebaseAuth.CreateCustomTokenAsync(uid);
        }

        public async Task DeleteUserAsync(string uid)
        {
            await _firebaseAuth.DeleteUserAsync(uid);
        }

        public async Task<UserRecord> GetUserByEmailAsync(string email)
        {
            return await _firebaseAuth.GetUserByEmailAsync(email);
        }

        public async Task<UserRecord> GetUserByUidAsync(string uid)
        {
            return await _firebaseAuth.GetUserAsync(uid);
        }

        public async Task<FirebaseSignInResult> SignInWithPasswordAsync(string email, string password)
        {
            var requestBody = new
            {
                email,
                password,
                returnSecureToken = true
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={_apiKey}",
                requestBody
            );

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                var errorResponse = JsonSerializer.Deserialize<FirebaseErrorResponse>(errorContent);

                var errorMessage = errorResponse?.Error?.Message ?? "UNKNOWN_ERROR";
                throw new FirebaseRestApiException($"Firebase sign-in failed: {errorMessage}", errorMessage);
            }

            var result = await response.Content.ReadFromJsonAsync<FirebaseSignInResult>();
            return result ?? throw new InvalidOperationException("Failed to deserialize Firebase response");
        }

        public async Task SendPasswordResetEmailAsync(string email)
        {
            var requestBody = new
            {
                requestType = "PASSWORD_RESET",
                email
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={_apiKey}",
                requestBody
            );

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                var errorResponse = JsonSerializer.Deserialize<FirebaseErrorResponse>(errorContent);

                var errorMessage = errorResponse?.Error?.Message ?? "UNKNOWN_ERROR";
                throw new FirebaseRestApiException($"Password reset failed: {errorMessage}", errorMessage);
            }
        }

        public async Task SendEmailVerificationAsync(string idToken)
        {
            var requestBody = new
            {
                requestType = "VERIFY_EMAIL",
                idToken
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={_apiKey}",
                requestBody
            );

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                var errorResponse = JsonSerializer.Deserialize<FirebaseErrorResponse>(errorContent);

                var errorMessage = errorResponse?.Error?.Message ?? "UNKNOWN_ERROR";
                throw new FirebaseRestApiException($"Email verification failed: {errorMessage}", errorMessage);
            }
        }

        public async Task<FirebaseSignInResult> ExchangeCustomTokenAsync(string customToken)
        {
            var requestBody = new
            {
                token = customToken,
                returnSecureToken = true
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key={_apiKey}",
                requestBody
            );

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                var errorResponse = JsonSerializer.Deserialize<FirebaseErrorResponse>(errorContent);

                var errorMessage = errorResponse?.Error?.Message ?? "UNKNOWN_ERROR";
                throw new FirebaseRestApiException($"Token exchange failed: {errorMessage}", errorMessage);
            }

            var result = await response.Content.ReadFromJsonAsync<FirebaseSignInResult>();
            return result ?? throw new InvalidOperationException("Failed to deserialize Firebase response");
        }

        private class FirebaseErrorResponse
        {
            public FirebaseError? Error { get; set; }
        }

        private class FirebaseError
        {
            public int Code { get; set; }
            public string Message { get; set; } = string.Empty;
            public string Status { get; set; } = string.Empty;
        }
    }
}
