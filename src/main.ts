import { app, BrowserWindow, Menu, Tray, ipcMain, type IpcMainEvent } from 'electron';
import path from 'path';

import { calcPath } from './utils/envs';
import { upserver } from './server/server';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

upserver();

const createTasktray = () => {
  const imgFilePath = calcPath('resources/mrdamian-icon.png');
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'credits',
      click: () => {
        new BrowserWindow().loadFile(calcPath('resources/LICENSES.dependency.html'));
      },
    },
    { label: 'quit', role: 'quit'}
   ]);
  const tray = new Tray(imgFilePath);
  tray.setToolTip(app.name);
  tray.setContextMenu(contextMenu);
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

let authWindow: BrowserWindow;

let twitchToken = "";
function handleSetToken(event: IpcMainEvent, token: string) {
  twitchToken = token;

  if( authWindow !== null ) {
    authWindow.destroy();
    authWindow = null;
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  ipcMain.on('set-token', handleSetToken);

  authWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  authWindow.loadURL('https://id.twitch.tv/oauth2/authorize?client_id=vpqmjg81mnkdsu1llaconpz0oayuqt&redirect_uri=http://localhost:54976/system/oauth&response_type=token&scope=moderator:manage:shoutouts+moderator:manage:announcements+user:manage:chat_color+chat:edit+chat:read+user:edit:broadcast+channel:manage:broadcast+channel_editor');
  authWindow.webContents.openDevTools();

  createTasktray();
  createWindow()
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
