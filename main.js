const { app, BrowserWindow, Menu, globalShortcut, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    backgroundColor: '#000000',
    title: 'Zombie Survival',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false // keep the game loop running at full speed
    }
  });

  // No application menu — it's a game.
  Menu.setApplicationMenu(null);

  win.loadFile('index.html');

  // Show only once the page is ready to avoid a white flash.
  win.once('ready-to-show', () => win.show());

  // F11 toggles fullscreen.
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    }
  });
}

// ---- Auto-update via GitHub Releases ----
function setupAutoUpdates() {
  // Updates only make sense in the packaged app, not in `npm start` dev mode.
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = false; // ask the player before downloading

  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'Update available',
      message: `Zombie Survival ${info.version} is available.`,
      detail: 'You have an older version. Download the update now?',
      buttons: ['Download', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then(({ response }) => {
      if (response === 0) autoUpdater.downloadUpdate();
    });
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'Update ready',
      message: 'Update downloaded.',
      detail: 'Restart now to play the latest version?',
      buttons: ['Restart now', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on('error', (err) => {
    console.error('Auto-update error:', err);
  });

  // Check on launch. Fails silently if offline.
  autoUpdater.checkForUpdates().catch(() => {});
}

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdates();

  // Ctrl+Shift+I opens dev tools for debugging.
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (win) win.webContents.toggleDevTools();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => globalShortcut.unregisterAll());
