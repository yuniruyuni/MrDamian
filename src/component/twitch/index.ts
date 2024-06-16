import { StaticAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';

import { type Field } from '../../model/variable';
import { type ComponentConfig } from '../../model/parameters';
import { Component } from '../../model/component';

import { DeviceCodeGrantFlow } from './oauth';

type LoginConfig = {
  action: 'login' | '' | undefined;
  channel: string;
};

type SendConfig = {
  action: 'send';
  args: {
    message: string;
  };
};

type TwitchConfig = ComponentConfig & (LoginConfig | SendConfig);

function isLoginConfig(
  config: TwitchConfig,
): config is ComponentConfig & LoginConfig {
  switch (config.action) {
    case 'login':
      return true;
    case '':
      return true;
    case undefined:
      return true;
    default:
      return false;
  }
}

export class Twitch extends Component<TwitchConfig> {
  async init(config: TwitchConfig): Promise<Field> {
    if (isLoginConfig(config)) {
      // we don't await this function call,
      // because system can process other things while user is processing login.
      this.login(config);
    }
    return undefined;
  }

  async run(config: TwitchConfig): Promise<Field> {
    switch (config.action) {
      case 'login':
      case '':
      case undefined:
        return undefined;
      case 'send':
        return await this.send(config);
      default:
        return undefined;
    }
  }

  authProvider: StaticAuthProvider;
  chatClient: ChatClient;
  channel?: string;

  async login(config: LoginConfig) {
    const flow = new DeviceCodeGrantFlow();
    this.authProvider = await flow.login();

    // start receiving thread so we don't await this call.
    this.startReceiveThread(config.channel);
  }

  public async send(config: SendConfig): Promise<Field> {
    // not yet logged-in.
    if (!this.channel || !this.chatClient) {
      return undefined;
    }

    await this.chatClient.say(this.channel, config.args.message);
    return undefined;
  }

  async startReceiveThread(channel: string): Promise<void> {
    this.chatClient = new ChatClient({
      authProvider: this.authProvider,
      channels: [channel],
    });
    await this.chatClient.connect();
    this.channel = channel;

    this.chatClient.onMessage((channel, user, message) => {
      this.emit({
        message: {
          channel: channel,
          user: user,
          message: message,
        }
      });
    });
  }
}
