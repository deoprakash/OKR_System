import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './components/ToastProvider'

console.log('Renderer: main.jsx loaded');
window.addEventListener('error', (e) => {
  console.error('Renderer uncaught error', e.error || e.message || e);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('Renderer unhandledrejection', e.reason || e);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
