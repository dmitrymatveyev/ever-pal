import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/viewAnalytics' // Load analytics debug utilities

// Initialize PostHog Analytics
if (import.meta.env.PROD && import.meta.env.VITE_POSTHOG_KEY && window.posthog) {
  window.posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // We'll handle pageviews manually via analytics.ts
    capture_pageleave: true,
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: {
        password: true
      }
    }
  });
  console.log('✅ PostHog Analytics initialized');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
