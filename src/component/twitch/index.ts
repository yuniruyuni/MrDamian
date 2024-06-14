import { BrowserWindow, shell } from 'electron';
import { setTimeout } from 'timers/promises';

import { type ComponentConfig } from '../../model/config';
import { type Variables } from '../../model/variable';

const clientId = "vpqmjg81mnkdsu1llaconpz0oayuqt"; // MrDamian's client id.

type TwitchOAuth2DeviceResponse = {
    device_code: string,
    expires_in: number,
    interval: number,
    user_code: string,
    verification_uri: string,
};

type TwitchOAuth2TokenResponse = {
    access_token: string,
    expires_in: number,
    refresh_token: string,
    scope: string[],
    token_type: string,
};

type TwitchOAuth2TokenErrorResponse = {
    status: number,
    message: string,
};

function tokenReceiveSuccessful(res: TwitchOAuth2TokenResponse | TwitchOAuth2TokenErrorResponse): res is TwitchOAuth2TokenResponse {
    if( "status" in res && res.status === 400 ) return false;
    return true;
}

export class Twitch {
    config: ComponentConfig;
    variables: Variables;

    public run(envs: Variables): Variables {
        // TODO: implement
        console.log("twitch componentn is running with", envs);

        if( envs.event.value === "system/initialize" ) {
            this.login();
        }

        return {};
    }

    authWindow: BrowserWindow;
    token: string;
    refresh: string;

    public async login() {
        const deviceRes = await this.fetchDeviceToken();
        shell.openExternal(deviceRes.verification_uri);

        const device_code = deviceRes.device_code;

        // TODO: add polling timeout.
        let tokenRes;
        do {
            tokenRes = await this.fetchTokenByDeviceCode(device_code);
            await setTimeout(1000); // 1second.
        } while ( !tokenReceiveSuccessful(tokenRes) );

        this.refresh = tokenRes?.refresh_token;
        this.token = tokenRes?.access_token;

        this.startReceiveThread();
    }

    async startReceiveThread() {
        // TODO: implement
    }

    async fetchDeviceToken(): Promise<TwitchOAuth2DeviceResponse> {
        const obj = {
            client_id: clientId,
            scopes: this.scopes(),
        };
        return this.post("https://id.twitch.tv/oauth2/device", obj);
    }

    async fetchTokenByDeviceCode(device_code: string): Promise<TwitchOAuth2TokenResponse | TwitchOAuth2TokenErrorResponse> {
        const obj = {
            client_id: clientId,
            scopes: this.scopes(),
            device_code,
            grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        };
        return await this.post("https://id.twitch.tv/oauth2/token", obj);
    }

    // because json result is essentialy any, disable eslint for any type.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async post(url: string, obj: { [key: string]: string}): Promise<any> {
        const method = "POST";
        const body = Object.entries(obj).map(
            ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        ).join("&");
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        };
        const res = await fetch(url, {method, headers, body})
        return await res.json();
    }

    scopes(): string {
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
        return scopes.join(" ");
    }
}
