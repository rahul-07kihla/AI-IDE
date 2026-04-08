const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = !app.isPackaged;
const devUrl = process.env.NOVA_IDE_URL || 'http://127.0.0.1:3001/dashboard/projects/sample-project';
const packagedIndexPath = path.join(__dirname, 'web-out', 'dashboard', 'projects', 'sample-project', 'index.html');

function createWindow() {
  const window = new BrowserWindow({
    width: 1600,
    height: 980,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#111111',
    title: 'Nova IDE',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    window.loadURL(devUrl);
    window.webContents.openDevTools({ mode: 'detach' });
  } else {
    if (fs.existsSync(packagedIndexPath)) {
      window.loadFile(packagedIndexPath);
    } else {
      window.loadURL(devUrl);
    }
  }

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
