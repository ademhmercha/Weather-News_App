import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import './index.css';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing: share of requests followed end-to-end. 100% is fine at this traffic
  // level; lower it (e.g. 0.2) if volume grows, to control Sentry quota usage.
  tracesSampleRate: 1.0,
  tracePropagationTargets: ['localhost', /^\/api\//],
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: true,
});

// Temporary: for generating demo/test events in the console — remove after.
window.Sentry = Sentry;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Une erreur est survenue. Merci de recharger la page.</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
