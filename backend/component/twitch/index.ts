import type { StaticAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";

import { Component } from "../../../model/component";
import type { ComponentConfig } from "../../../model/parameters";
import type { Field } from "../../../model/variable";

import { DeviceCodeGrantFlow } from "./oauth";

type LoginConfig = {
  action: "login" | "" | undefined;
  channel: string;
};

type SendConfig = {
  action: "send";
  args: {
    message: string;
  };
};

type TwitchConfig = ComponentConfig & (LoginConfig | SendConfig);

function isLoginConfig(
  config: TwitchConfig,
): config is ComponentConfig & LoginConfig {
  if (config.action === undefined) return true;
  if (config.action === "") return true;
  if (config.action === "login") return true;
  return false;
}

function isSendConfig(
  config: TwitchConfig,
): config is ComponentConfig & SendConfig {
  return config.action === "send";
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
    if (isLoginConfig(config)) {
      return undefined;
    }

    if (isSendConfig(config)) {
      return await this.send(config);
    }

    return undefined;
  }

  authProvider?: StaticAuthProvider;
  chatClient?: ChatClient;
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
        },
      });
    });
  }
}
