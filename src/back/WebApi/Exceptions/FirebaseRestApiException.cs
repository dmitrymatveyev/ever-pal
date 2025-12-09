namespace EverPal.WebApi.Exceptions
{
    public class FirebaseRestApiException : Exception
    {
        public string ErrorCode { get; }

        public FirebaseRestApiException(string message, string errorCode) : base(message)
        {
            ErrorCode = errorCode;
        }

        public FirebaseRestApiException(string message, string errorCode, Exception innerException)
            : base(message, innerException)
        {
            ErrorCode = errorCode;
        }
    }
}
