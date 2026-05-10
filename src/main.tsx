import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { setupInstallCapture } from './pwa/install';
import { registerServiceWorker } from './pwa/register';

import './styles/global.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root element');

// Capture `beforeinstallprompt` BEFORE React mounts — Chromium fires the
// event early in the page lifecycle and we'd miss it otherwise.
setupInstallCapture();

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();
