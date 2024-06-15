import { setTimeout } from 'timers/promises';
import open from 'open';
import { StaticAuthProvider } from '@twurple/auth';

const clientId = 'vpqmjg81mnkdsu1llaconpz0oayuqt'; // MrDamian's client id.

type OAuth2DeviceResponse = {
  device_code: string;
  expires_in: number;
  interval: number;
  user_code: string;
  verification_uri: string;
};

type OAuth2TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string[];
  token_type: string;
};

type OAuth2TokenErrorResponse = {
  status: number;
  message: string;
};

export class DeviceCodeGrantFlow {
  public async login(): Promise<StaticAuthProvider> {
    const deviceRes = await this.fetchDeviceToken();
    open(deviceRes.verification_uri);

    const device_code = deviceRes.device_code;

    // TODO: add polling timeout.
    let tokenRes;
    do {
      tokenRes = await this.fetchTokenByDeviceCode(device_code);
      await setTimeout(1000); // 1second.
    } while (!this.tokenReceiveSuccessful(tokenRes));

    return new StaticAuthProvider(clientId, tokenRes.access_token);
  }

  async fetchDeviceToken(): Promise<OAuth2DeviceResponse> {
    const obj = {
      client_id: clientId,
      scopes: this.scopesstr(),
    };
    return this.post('https://id.twitch.tv/oauth2/device', obj);
  }

  async fetchTokenByDeviceCode(
    device_code: string,
  ): Promise<OAuth2TokenResponse | OAuth2TokenErrorResponse> {
    const obj = {
      client_id: clientId,
      scopes: this.scopesstr(),
      device_code,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    };
    return await this.post('https://id.twitch.tv/oauth2/token', obj);
  }

  // because json result is essentialy any, disable eslint for any type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async post(url: string, obj: { [key: string]: string }): Promise<any> {
    const method = 'POST';
    const body = Object.entries(obj)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join('&');
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    };
    const res = await fetch(url, { method, headers, body });
    return await res.json();
  }

  scopesstr(): string {
    return this.scopes().join(' ');
  }

  scopes(): string[] {
    return [
      'moderator:manage:shoutouts',
      'moderator:manage:announcements',
      'user:manage:chat_color',
      'chat:edit',
      'chat:read',
      'user:edit:broadcast',
      'channel:manage:broadcast',
      'channel_editor',
    ];
  }

  tokenReceiveSuccessful(
    res: OAuth2TokenResponse | OAuth2TokenErrorResponse,
  ): res is OAuth2TokenResponse {
    if ('status' in res && res.status === 400) return false;
    return true;
  }
}
