namespace EverPal.WebApi.Validators
{
    public static class Base64Validator
    {
        private const int MaxBase64Size = 2 * 1024 * 1024; // 2MB in bytes

        public static bool IsValidBase64Image(string? base64String)
        {
            if (string.IsNullOrEmpty(base64String))
            {
                return true; // Null/empty is valid (optional field)
            }

            // Check size limit
            if (base64String.Length > MaxBase64Size)
            {
                return false;
            }

            // Check if it starts with data:image prefix
            if (!base64String.StartsWith("data:image/"))
            {
                return false;
            }

            // Extract base64 part after the comma
            var commaIndex = base64String.IndexOf(',');
            if (commaIndex == -1)
            {
                return false;
            }

            var base64Data = base64String.Substring(commaIndex + 1);

            // Validate base64 format
            if (string.IsNullOrWhiteSpace(base64Data))
            {
                return false;
            }

            // Check if it's valid base64
            try
            {
                Convert.FromBase64String(base64Data);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
