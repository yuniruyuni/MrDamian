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
  public run(envs: TwitchParameters): Environment {
    // TODO: implement
    console.log('twitch componentn is running with', envs);

    if (envs.event === 'system/initialize') {
      this.login();
    }

    return {};
  }

  authProvider: StaticAuthProvider;

  public async login() {
    console.log('login() started');

    const flow = new DeviceCodeGrantFlow();
    this.authProvider = await flow.login();

    this.startReceiveThread();
  }

  async startReceiveThread(): Promise<void> {
    const chatClient = new ChatClient({
      authProvider: this.authProvider,
      channels: [this.params.channel],
    });
    await chatClient.connect();

    chatClient.onMessage((channel, user, message) => {
      console.log(`${channel} - ${user}: ${message}`);
      // TODO: implement event sender.
      // this.send({
      //     event: "twitch/message",
      // });
    });
  }
}
