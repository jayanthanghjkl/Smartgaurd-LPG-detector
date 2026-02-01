import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * PRODUCTION POLYFILLS
 * Essential for mobile browsers that might not have Node-like environment globals.
 */
(window as any).global = window;
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: { NODE_ENV: 'production' },
    browser: true,
    cwd: () => '/',
  };
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorMsg = "Critical: Root element #root not found in DOM.";
  console.error(errorMsg);
  // Manual fallback for mobile users to see the error
  document.body.innerHTML = `<div style="padding:40px; color:red; font-family:sans-serif;">${errorMsg}</div>`;
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("React Mounting Error:", err);
    // This will be caught by the window.onerror handler in index.html and displayed
    throw err;
  }
}