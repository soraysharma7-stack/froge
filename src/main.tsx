import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global suppressor for third-party extension errors trying to override fetch
if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (event) => {
      const msg = event?.message || event?.error?.message || '';
      if (typeof msg === 'string' && (msg.includes('Cannot set property fetch') || msg.includes('has only a getter'))) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = event?.reason;
      const msg = typeof reason === 'string' ? reason : reason?.message || '';
      if (typeof msg === 'string' && (msg.includes('Cannot set property fetch') || msg.includes('has only a getter'))) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
