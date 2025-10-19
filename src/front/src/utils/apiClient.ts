/**
 * Enhanced fetch wrapper with cold start detection and retry logic
 */

interface FetchWithColdStartOptions extends RequestInit {
  onColdStartDetected?: () => void;
  onColdStartResolved?: () => void;
  maxRetries?: number;
  slowThreshold?: number; // milliseconds
}

/**
 * Fetch wrapper that detects slow responses (likely cold starts) and retries on failure
 */
export const fetchWithColdStart = async (
  url: string,
  options: FetchWithColdStartOptions = {}
): Promise<Response> => {
  const {
    onColdStartDetected,
    onColdStartResolved,
    maxRetries = 3,
    slowThreshold = 2000, // 2 seconds
    ...fetchOptions
  } = options;

  let coldStartDetected = false;
  let timeoutId: number | null = null;

  // Set up cold start detection timer
  const coldStartPromise = new Promise<void>((resolve) => {
    timeoutId = setTimeout(() => {
      coldStartDetected = true;
      onColdStartDetected?.();
      resolve();
    }, slowThreshold);
  });

  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Race between the fetch and cold start detection
      const fetchPromise = fetch(url, fetchOptions);

      // Start both promises
      const response = await Promise.race([
        fetchPromise,
        coldStartPromise.then(() => fetchPromise)
      ]);

      // Clear the timeout if request completed quickly
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Notify that cold start is resolved
      if (coldStartDetected && onColdStartResolved) {
        onColdStartResolved();
      }

      // Check if response is ok
      if (!response.ok && attempt < maxRetries - 1) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      return response;
    } catch (error) {
      // Clear timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        if (coldStartDetected && onColdStartResolved) {
          onColdStartResolved();
        }
        throw error;
      }

      // Wait before retrying (exponential backoff: 1s, 2s, 4s)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error('Max retries exceeded');
};

/**
 * Helper function to create API calls with cold start handling
 */
export const createApiCall = <T>(
  url: string,
  options: FetchWithColdStartOptions,
  onColdStartDetected?: () => void,
  onColdStartResolved?: () => void
): Promise<T> => {
  return fetchWithColdStart(url, {
    ...options,
    onColdStartDetected,
    onColdStartResolved,
  }).then(async (response) => {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
};
