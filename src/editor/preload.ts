import { contextBridge, ipcRenderer } from 'electron';

declare global {
  interface Window {
    clips: ClipsApi;
  }
}

export interface ClipsApi {
  onSetClips: (listener: (clips: string) => void) => () => void;
}

contextBridge.exposeInMainWorld('clips', {
  onSetClips: (callback: (clips: string) => void) => ipcRenderer.on('set-clips', (_event, value) => callback(value)),
});
