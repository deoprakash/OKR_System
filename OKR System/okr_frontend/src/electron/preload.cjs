// Minimal preload script: forward errors and provide a small safe API.
const { contextBridge, ipcRenderer } = require('electron')

// Expose a minimal API to the renderer in a safe way if contextBridge is available
try {
  if (contextBridge && ipcRenderer) {
    contextBridge.exposeInMainWorld('__electron', {
      send: (channel, ...args) => ipcRenderer.send(channel, ...args),
      on: (channel, cb) => ipcRenderer.on(channel, (event, ...args) => cb(...args)),
      showMessage: (options) => ipcRenderer.invoke('show-message', options),
    })
  }
} catch (e) {
  // ignore
}

// Global error handlers in the renderer to surface errors to the main process logs
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    try { console.error('preload-window-error', e && (e.error || e.message || e)); } catch (err) {}
  });
  window.addEventListener('unhandledrejection', (e) => {
    try { console.error('preload-unhandledrejection', e && (e.reason || e)); } catch (err) {}
  });
}

// Helpful flag for debugging
try { global.__preload_loaded = true } catch (e) {}
