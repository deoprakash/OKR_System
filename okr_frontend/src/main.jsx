import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)
