
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Console banner to verify build and layout flag
(() => {
  const ts = new Date().toISOString();
  const params = new URL(window.location.href).searchParams;
  const ui = params.get('ui') || localStorage.getItem('ui:topPanel') || 'default';
  // eslint-disable-next-line no-console
  console.info(`[Liquid] build=${ts} ui=${ui}`);
})();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
