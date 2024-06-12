import { BrowserWindow } from 'electron';
import path from 'path';
import { hotload } from '../utils/hotload';

import { StaticAuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { ChatClient } from '@twurple/chat';

export class Editor {
    window: BrowserWindow;

    public async onLoggedIn(clientId: string, token: string) {
        // following routine is just test for twitch api call...
        const authProvider = new StaticAuthProvider(clientId, token);
        const chatClient = new ChatClient({ authProvider, channels: ['yuniruyuni'] });
        await chatClient.connect();
        await chatClient.say('yuniruyuni', "test say.");
        const apiClient = new ApiClient({ authProvider });
        const channel_id = await apiClient.users.getUserByName("yuniruyuni");
        const res = await apiClient.clips.getClipsForBroadcaster(channel_id);

        let clips = "";
        for( const clip of res.data ) {
            clips += `${clip.broadcasterDisplayName}(${clip.creationDate}): ${clip.title}\n`;
        }
        this.window.webContents.send('set-clips', clips);
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
