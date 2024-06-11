import path from 'path';
import { BrowserWindow, ipcMain, type IpcMainEvent } from 'electron';
import { type Express } from 'express';
import { isDev } from '../../utils/envs';
import { register_endpoints } from './server';

const client_id = "vpqmjg81mnkdsu1llaconpz0oayuqt"; // MrDamian's client id.

export class Twitch {
    authWindow: BrowserWindow;
    token: string;

    constructor(server: Express) {
        register_endpoints(server);
    }

    public onReady() {
        ipcMain.on('set-token', (event, token) => this.handleSetToken(event, token));
        this.authWindow = new BrowserWindow({
            webPreferences: {
                preload: path.join(__dirname, 'component/twitch/preload.js')
            }
        });
        this.authWindow.loadURL(this.calc_twitch_authorize_url());
        if( isDev ) {
            this.authWindow.webContents.openDevTools();
        }
    }

    handleSetToken(event: IpcMainEvent, token: string) {
        this.token = token;

        if( this.authWindow ) {
            this.authWindow.destroy();
            this.authWindow = undefined;
        }
    }

    calc_twitch_authorize_url(): string {
        const scopes = [
            "moderator:manage:shoutouts",
            "moderator:manage:announcements",
            "user:manage:chat_color",
            "chat:edit",
            "chat:read",
            "user:edit:broadcast",
            "channel:manage:broadcast",
            "channel_editor",
        ];

        const endpoint = "https://id.twitch.tv/oauth2/authorize";

        const params = {
            client_id: client_id,
            response_type: "token",
            redirect_uri: "http://localhost:54976/system/oauth",
            scope: scopes.join('+'),
        };

        return endpoint + "?" + Object.entries(params).map(([key, val]) => `${key}=${val}`).join('&');
    }
}
