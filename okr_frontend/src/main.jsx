import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/app.css'
import App from './App.jsx'
import { ToastProvider } from './components/ToastProvider'
import { AuthProvider } from './context/AuthContext'

console.log('Renderer: main.jsx loaded');
window.addEventListener('error', (e) => {
  console.error('Renderer uncaught error', e.error || e.message || e);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('Renderer unhandledrejection', e.reason || e);
});

// Prevent mouse clicks from moving focus to buttons in the renderer (preserve keyboard focus behavior)
// This ensures the same focus behavior in the packaged Electron exe.
const _preventMouseFocus = (e) => {
  try {
    const el = e.target;
    if (!el) return;
    // allow inputs, selects, textareas and contenteditable elements to receive focus on mouse click
    if (el.closest && el.closest('input, textarea, select, [contenteditable]')) return;
    // if the click is on a <button> (or inside one), prevent the mousedown default to avoid stealing focus
    const btn = (el.tagName === 'BUTTON') ? el : (el.closest ? el.closest('button') : null);
    if (btn) e.preventDefault();
  } catch (err) {
    // swallow errors to avoid breaking renderer
  }
};
document.addEventListener('mousedown', _preventMouseFocus, true);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)
