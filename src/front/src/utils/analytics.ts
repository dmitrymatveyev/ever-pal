/**
 * Simple analytics utility for tracking user events
 * Integrated with PostHog for production analytics and session replay
 */

// TypeScript declaration for PostHog
declare global {
  interface Window {
    posthog?: {
      init: (apiKey: string, config?: Record<string, any>) => void;
      capture: (event: string, properties?: Record<string, any>) => void;
      identify: (userId: string, properties?: Record<string, any>) => void;
      reset: () => void;
    };
  }
}

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private enabled: boolean;

  constructor() {
    // Enable analytics in production, disable in development
    this.enabled = import.meta.env.PROD;
  }

  /**
   * Track an event
   */
  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date()
    };

    this.events.push(analyticsEvent);

    // Log to console in development
    if (!this.enabled) {
      console.log('[Analytics]', event, properties);
    }

    // Send to PostHog in production
    if (this.enabled && window.posthog) {
      try {
        window.posthog.capture(event, properties);
      } catch (err) {
        console.error('Failed to send event to PostHog:', err);
      }
    }

    // Also store locally for debugging and backup
    this.storeLocally(analyticsEvent);
  }

  /**
   * Identify a user (call this after authentication)
   */
  identify(userId: string, properties?: Record<string, any>) {
    if (this.enabled && window.posthog) {
      try {
        window.posthog.identify(userId, properties);
      } catch (err) {
        console.error('Failed to identify user in PostHog:', err);
      }
    }
  }

  /**
   * Reset user identity (call this on logout)
   */
  reset() {
    if (this.enabled && window.posthog) {
      try {
        window.posthog.reset();
      } catch (err) {
        console.error('Failed to reset PostHog:', err);
      }
    }
  }

  /**
   * Store events in localStorage for debugging
   */
  private storeLocally(event: AnalyticsEvent) {
    try {
      const stored = localStorage.getItem('analytics_events');
      const events = stored ? JSON.parse(stored) : [];
      events.push(event);

      // Keep only last 100 events
      if (events.length > 100) {
        events.shift();
      }

      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (err) {
      // Ignore localStorage errors
      console.error('Failed to store analytics event:', err);
    }
  }

  /**
   * Get all tracked events (for debugging)
   */
  getEvents(): AnalyticsEvent[] {
    return this.events;
  }

  /**
   * Clear all events
   */
  clear() {
    this.events = [];
    localStorage.removeItem('analytics_events');
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Convenience functions
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  analytics.track(event, properties);
};

export const trackPageView = (page: string) => {
  analytics.track('page_view', { page });
};

export const trackFormInteraction = (formName: string, field: string, action: string) => {
  analytics.track('form_interaction', { formName, field, action });
};

export const trackFormSubmit = (formName: string, success: boolean, error?: string) => {
  analytics.track('form_submit', { formName, success, error });
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  analytics.identify(userId, properties);
};

export const resetUser = () => {
  analytics.reset();
};
