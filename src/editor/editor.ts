import { type Express } from 'express';
import { BrowserWindow } from 'electron';
import path from 'path';
import { hotload } from '../utils/hotload';

export class Editor {
    window: BrowserWindow;

    constructor(server: Express) {
        // register_endpoints(server);
    }

    public onReady() {
        this.createWindow();
    }

    public onActivate() {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            this.createWindow();
        }
    }

    createWindow() {
        this.window = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                preload: path.join(__dirname, 'editor/preload.js')
            }
        });

        hotload(this.window, VITE_EDITOR_HOTLOAD);
        this.window.webContents.openDevTools();
    }
}
