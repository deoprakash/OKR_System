const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const { request } = require('http')
const { request: httpsRequest } = require('https')
const { URL } = require('url')
const { ipcMain, dialog } = require('electron');

function waitForServer(urlString, retries = 10, delayMs = 500) {
  const url = new URL(urlString);
  const isHttps = url.protocol === 'https:';
  const doRequest = isHttps ? httpsRequest : request;
  let attempt = 0;
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      attempt++;
      const opts = { method: 'HEAD', hostname: url.hostname, port: url.port, path: url.pathname || '/' };
      const req = doRequest(opts, (res) => {
        // any response means the server is reachable
        resolve({ statusCode: res.statusCode });
      });
      req.on('error', (err) => {
        if (attempt >= retries) return reject(err);
        setTimeout(tryOnce, delayMs);
      });
      req.end();
    };
    tryOnce();
  });
}

const createWindow = async () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  })

  const env = process.env.NODE_ENV || 'production';
  console.log('Electron starting, NODE_ENV=', env, 'VITE_DEV_SERVER_URL=', process.env.VITE_DEV_SERVER_URL);

  if (env === 'development') {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    try {
      console.log('Waiting for dev server:', devUrl);
      const res = await waitForServer(devUrl, 20, 300);
      console.log('Dev server reachable, statusCode=', res && res.statusCode);
      await win.loadURL(devUrl);
      win.show();
      try { win.webContents.openDevTools({ mode: 'detach' }); } catch (e) { console.error('openDevTools failed', e); }
    } catch (err) {
      console.error('Failed to reach dev server:', err && err.message ? err.message : err);
      const errHtml = `
        <h2>Dev server not reachable</h2>
        <p>Attempted to load: ${devUrl}</p>
        <pre>${String(err)}</pre>
      `;
      try {
        win.loadURL(`data:text/html,${encodeURIComponent(errHtml)}`);
      } catch (e) {
        console.error('Failed to show error page', e);
      } finally {
        win.show();
      }
    }
  } else {
    // Load built index.html from dist
    try {
      const p = path.join(app.getAppPath(), 'dist', 'index.html');
      console.log('Loading production file:', p);
      await win.loadFile(p);
      win.show();
    } catch (err) {
      console.error('Failed to load production build:', err);
      const errHtml = `<h2>Failed to load app</h2><pre>${String(err)}</pre>`;
      try { await win.loadURL(`data:text/html,${encodeURIComponent(errHtml)}`); } catch (e) { console.error(e); } finally { win.show(); }
    }
  }

  // Log load failures to help diagnose white screen
  if (win.webContents && typeof win.webContents.on === 'function') {
    win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('did-fail-load', errorCode, errorDescription, validatedURL);
    });
    // Forward renderer console messages to main process logs to aid debugging
    win.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`Renderer console (${level}) ${sourceId}:${line} -> ${message}`);
    });
    // Open DevTools to inspect renderer even in production for debugging
    try { win.webContents.openDevTools({ mode: 'detach' }); } catch (e) { console.error('openDevTools failed', e); }
    win.webContents.on('crashed', () => console.error('Renderer crashed'));
  }
}

app.whenReady().then(() => {
  // Remove this line to restore the default menu bar
  // Menu.setApplicationMenu(null);
  createWindow();
})

// IPC handler to show native message boxes from renderer
ipcMain.handle('show-message', async (event, options) => {
  return await dialog.showMessageBox({
    type: options && options.type ? options.type : 'info',
    title: options && options.title ? options.title : 'Message',
    message: options && options.message ? options.message : '',
    buttons: options && options.buttons ? options.buttons : ['OK']
  });
});
