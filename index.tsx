import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * CRITICAL POLYFILLS
 * Must run before any other logic to prevent 'process' or 'global' reference errors.
 */
(window as any).global = window;
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: { NODE_ENV: 'production' },
    browser: true,
    cwd: () => '/',
  };
}

const mountApp = () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    const errorMsg = "Critical: Root element #root not found in DOM.";
    console.error(errorMsg);
    document.body.innerHTML = `<div style="padding:40px; color:red; font-family:sans-serif;">${errorMsg}</div>`;
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err: any) {
    console.error("React Mounting Error:", err);
    // Explicitly trigger the window.onerror for the mobile debug overlay
    if (window.onerror) {
      window.onerror(err.message || String(err), 'index.tsx', 0, 0, err);
    }
  }
};

// Wait for DOM to be ready to ensure #root exists on slow mobile parses
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}