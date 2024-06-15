import { StaticAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';

import { type Environment } from '../../model/variable';
import { type ComponentParameters } from '../../model/parameters';
import { Component } from '../../model/component';

import { DeviceCodeGrantFlow } from './oauth';

type TwitchParameters = ComponentParameters & {
  channel: string;
};

export class Twitch extends Component<TwitchParameters> {
  public async run(envs: TwitchParameters): Promise<Environment> {
    if (envs.event === 'system/initialize') {
      // we don't await this function call,
      // because system can process other things while user is processing login.
      this.login();
    }

    return {};
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
      channels: [this.params.channel],
    });
    await chatClient.connect();

    chatClient.onMessage((channel, user, message) => {
      this.send({
        event: "twitch/message",
        channel: channel,
        user: user,
        message: message,
      });
    });
  }
}
