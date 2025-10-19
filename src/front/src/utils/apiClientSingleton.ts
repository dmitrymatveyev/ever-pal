/**
 * Singleton API client with cold start detection
 * This can be used in service files without React hooks
 */

type ColdStartCallback = (isWakingUp: boolean, message?: string) => void;

class ApiClient {
  private coldStartCallback: ColdStartCallback | null = null;
  private readonly slowThreshold = 2000; // 2 seconds
  private readonly maxRetries = 3;

  /**
   * Register a callback to be called when cold start is detected/resolved
   */
  registerColdStartCallback(callback: ColdStartCallback) {
    this.coldStartCallback = callback;
  }

  /**
   * Enhanced fetch with cold start detection and retry logic
   */
  async fetch<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    let coldStartDetected = false;
    let timeoutId: number | null = null;

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        // Set up cold start detection timer
        timeoutId = setTimeout(() => {
          coldStartDetected = true;
          this.coldStartCallback?.(true, 'Waking up the server...');
        }, this.slowThreshold);

        const response = await fetch(url, options);

        // Clear the timeout if request completed
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Notify that cold start is resolved if it was detected
        if (coldStartDetected) {
          this.coldStartCallback?.(false);
        }

        // Check if response is ok
        if (!response.ok && attempt < this.maxRetries - 1) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        // Handle empty responses (like DELETE operations)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return response.json();
        }

        return undefined as T;
      } catch (error) {
        // Clear timeout on error
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Resolve cold start indicator on error
        if (coldStartDetected) {
          this.coldStartCallback?.(false);
        }

        // If this is the last attempt, throw the error
        if (attempt === this.maxRetries - 1) {
          throw error;
        }

        // Wait before retrying (exponential backoff: 1s, 2s, 4s)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // This should never be reached, but TypeScript needs it
    throw new Error('Max retries exceeded');
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
