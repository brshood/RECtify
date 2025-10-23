import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App'
import '../styles/globals.css'
import { AuthProvider } from '../components/AuthContext'
import * as Sentry from '@sentry/react'

// Initialize Sentry error monitoring
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_NODE_ENV || 'production',
  
  // Performance Monitoring
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(), // Session replay on errors
  ],
  
  // Performance: Sample 10% of transactions
  tracesSampleRate: 0.1,
  
  // Session Replay: Capture 100% of sessions with errors
  replaysSessionSampleRate: 0, // 0% of normal sessions
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions
  
  // Remove sensitive data from error reports
  beforeSend(event) {
    // Strip passwords from any captured data
    if (event.request?.data && typeof event.request.data === 'object') {
      const data = event.request.data as Record<string, any>;
      if (data.password) {
        data.password = '[REDACTED]';
      }
      if (data.resetCode) {
        data.resetCode = '[REDACTED]';
      }
    }
    
    // Strip authorization headers
    if (event.request?.headers && typeof event.request.headers === 'object') {
      const headers = event.request.headers as Record<string, any>;
      delete headers.authorization;
    }
    
    return event;
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
