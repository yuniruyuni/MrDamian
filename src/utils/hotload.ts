import { BrowserWindow } from 'electron';
import path from 'path';

// hotload index.html of specified name renderer.
export function hotload(window: BrowserWindow, target: ViteHotload) {
    if (target.url) {
        window.loadURL(target.url);
    } else {
        window.loadFile(path.join(__dirname, '../../../', target.path));
    }
}
