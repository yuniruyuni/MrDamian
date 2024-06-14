import { app, BrowserWindow, Menu, Tray } from 'electron';
import squirrelStartup from 'electron-squirrel-startup';

import { calcPath } from './utils/envs';

import { Editor } from './editor/editor';

import { loadModuleConfig } from "./model/config";
import { type ComponentConstructors, ModuleFactory } from "./model/module";

import { Twitch } from './component/twitch';
import { Youtube } from './component/youtube';
import { Logger } from './component/logger';
import { Panel } from './component/panel';
import { Translate } from './component/translate';

const constructors: ComponentConstructors = {
  twitch: Twitch,
  youtube: Youtube,

  logger: Logger,
  panel: Panel,
  translate: Translate,
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) {
  app.quit();
}

const editor = new Editor({
  onTwitchLoginClick: () => {
    console.log("ok");
  },
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
app.on('ready', async () => {
  createTasktray();
  editor.onReady();

  const factory = new ModuleFactory(constructors);
  const config = await loadModuleConfig("./config/main.jsonc");
  const mod = factory.constructModule(config);

  for( ; ; ) {
    await mod.run({});
  }
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
