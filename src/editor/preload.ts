import { contextBridge, ipcRenderer } from 'electron';

declare global {
  interface Window {
    editor: EditorApi;
  }
}

export interface EditorApi {
  onSetClips: (listener: (clips: string) => void) => () => void;
  twitchLoginClick: () => void;
}

contextBridge.exposeInMainWorld('editor', {
  onSetClips: (callback: (clips: string) => void) => ipcRenderer.on('set-clips', (_event, value) => callback(value)),
  twitchLoginClick: () => ipcRenderer.send('twitch-loggin-click'),
});
