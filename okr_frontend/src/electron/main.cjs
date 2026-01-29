const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  if (process.env.NODE_ENV === 'development') {
    // Load Vite dev server
    win.loadURL('http://localhost:5173')
  } else {
    // Load built index.html from dist
    win.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'))
  }
}

app.whenReady().then(() => {
  // Remove this line to restore the default menu bar
  // Menu.setApplicationMenu(null);
  createWindow();
})
