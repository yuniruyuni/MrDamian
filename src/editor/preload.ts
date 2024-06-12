import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('clips', {
  onSetClips: (callback: (clips: string) => void) => ipcRenderer.on('set-clips', (_event, value) => callback(value))
});
