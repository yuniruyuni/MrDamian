import { StaticAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';

import { type Field } from '../../model/variable';
import { type ComponentConfig } from '../../model/parameters';
import { Component } from '../../model/component';

import { DeviceCodeGrantFlow } from './oauth';

type TwitchConfig = ComponentConfig & {
  channel: string;
};

export class Twitch extends Component<TwitchConfig> {
  async init(): Promise<Field> {
    // we don't await this function call,
    // because system can process other things while user is processing login.
    this.login();
    return undefined;
  }

  async run(): Promise<Field> {
    return undefined;
  }

  authProvider: StaticAuthProvider;

  public async login() {
    const flow = new DeviceCodeGrantFlow();
    this.authProvider = await flow.login();

    // start receiving thread so we don't await this call.
    this.startReceiveThread();
  }

  async startReceiveThread(): Promise<void> {
    const chatClient = new ChatClient({
      authProvider: this.authProvider,
      channels: [this.config.channel],
    });
    await chatClient.connect();

    chatClient.onMessage((channel, user, message) => {
      this.send({
        event: 'twitch/message',
        channel: channel,
        user: user,
        message: message,
      });
    });
  }
}
