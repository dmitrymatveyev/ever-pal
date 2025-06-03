using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;

namespace EverPal.WebApi.Configuration
{
    public static class FirebaseInitializer
    {
        public static void Initialize(IConfiguration configuration)
        {
            if (FirebaseApp.DefaultInstance == null)
            {
                FirebaseApp.Create(new AppOptions
                {
                    Credential = GoogleCredential.GetApplicationDefault()
                });
            }
        }
    }
}