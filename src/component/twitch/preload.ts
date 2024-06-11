import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  setToken: (token: string) => ipcRenderer.send('set-token', token),
});
