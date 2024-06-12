import { app, BrowserWindow, Menu, Tray } from 'electron';
import squirrelStartup from 'electron-squirrel-startup';

import { calcPath } from './utils/envs';

import { Editor } from './editor/editor';
import { Twitch } from './component/twitch';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) {
  app.quit();
}

const clientId = "vpqmjg81mnkdsu1llaconpz0oayuqt"; // MrDamian's client id.

const editor = new Editor();
const twitch = new Twitch({
  clientId: clientId,
  onComplete: (twitch) => editor.onLoggedIn( clientId, twitch.token, twitch.refresh ),
});

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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createTasktray();
  editor.onReady();
  twitch.onReady();
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
  editor.onActivate();
});
