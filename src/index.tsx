import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";

import "./style/classes.css";
// @ts-ignore
import "./style/index.css";
// @ts-ignore
import "./App.css";
import "./style/applies.css";

// Console error suppression for production security
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args.join(' ');

  // Suppress sensitive backend-related errors
  if (
    message.includes('langflow-tv34o.ondigitalocean.app') ||
    message.includes('backend.axiestudio.se') ||
    message.includes('401') ||
    message.includes('403') ||
    message.includes('400') ||
    message.includes('Unauthorized') ||
    message.includes('Forbidden') ||
    message.includes('Bad Request') ||
    message.includes('Failed to load resource') ||
    message.includes('auto_login') ||
    message.includes('refresh') ||
    message.includes('manifest.json')
  ) {
    // Silently suppress these errors in production
    if (process.env.NODE_ENV === 'development') {
      originalConsoleError('[DEV] Suppressed:', ...args);
    }
    return;
  }

  // Allow other errors through
  originalConsoleError(...args);
};

console.warn = (...args) => {
  const message = args.join(' ');

  // Suppress sensitive backend-related warnings
  if (
    message.includes('langflow-tv34o.ondigitalocean.app') ||
    message.includes('backend.axiestudio.se') ||
    message.includes('401') ||
    message.includes('403') ||
    message.includes('400')
  ) {
    if (process.env.NODE_ENV === 'development') {
      originalConsoleWarn('[DEV] Suppressed:', ...args);
    }
    return;
  }

  originalConsoleWarn(...args);
};

// Suppress unhandled promise rejections that expose backend URLs
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || event.reason?.toString() || '';

  if (
    message.includes('langflow-tv34o.ondigitalocean.app') ||
    message.includes('backend.axiestudio.se') ||
    message.includes('401') ||
    message.includes('403') ||
    message.includes('400')
  ) {
    event.preventDefault(); // Prevent the error from being logged
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV] Suppressed unhandled rejection:', event.reason);
    }
  }
});

// @ts-ignore
import App from "./customization/custom-App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(<App />);
reportWebVitals();
