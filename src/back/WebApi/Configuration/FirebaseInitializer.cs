using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;

namespace EverPal.WebApi.Configuration
{
    public static class FirebaseInitializer
    {
        public static void Initialize(IConfiguration configuration)
        {
            // Check if the Firebase Admin SDK has already been initialized
            if (FirebaseApp.DefaultInstance == null)
            {
                // This expects the GOOGLE_APPLICATION_CREDENTIALS environment variable 
                // to be set to the path of your service account JSON file
                FirebaseApp.Create(new AppOptions
                {
                    Credential = GoogleCredential.GetApplicationDefault()
                });
            }
        }
    }
}