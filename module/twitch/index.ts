import type { StaticAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import type { Action, Component, EventEmitter, Field } from "module/lib";
import { DeviceCodeGrantFlow } from "./oauth";

type LoginAction = {
	action: "login" | "" | undefined;
	channel: string;
};

type ReceiveAction = {
	action: "receive";
};

type SendAction = {
	action: "send";
	args: {
		message: string;
	};
};

type TwitchAction = Action & (LoginAction | SendAction | ReceiveAction);

function isLoginAction(
	action: TwitchAction,
): action is Action & LoginAction {
	if (action.action === undefined) return true;
	if (action.action === "") return true;
	if (action.action === "login") return true;
	return false;
}

function isSendAction(
	action: TwitchAction,
): action is Action & SendAction {
	return action.action === "send";
}

function isReceiveAction(
	action: TwitchAction,
): action is Action & ReceiveAction {
	return action.action === "receive";
}

export default class Twitch implements Component<TwitchAction> {
	emitters: EventEmitter[] = [];

	async initialize(action: TwitchAction, emitter: EventEmitter): Promise<void> {
		if( isLoginAction(action) || isReceiveAction(action) ) {
			this.emitters.push(emitter);
		}
	}

	async start(action: TwitchAction): Promise<void> {
		if (isLoginAction(action)) {
			// we don't await this function call,
			// because system can process other things while user is processing login.
			await this.login(action);
		}
	}

	async process(action: TwitchAction): Promise<Field> {
		if (isLoginAction(action)) {
			return undefined;
		}

		if (isSendAction(action)) {
			return await this.send(action);
		}

		return undefined;
	}

	async stop(_action: TwitchAction): Promise<void> {
		this.chatClient?.quit();
		this.chatClient = undefined;
		this.channel = undefined;
	}

	async uninitialize(): Promise<void> {
		this.emitters = [];
	}

	authProvider?: StaticAuthProvider;
	chatClient?: ChatClient;
	channel?: string;

	async login(action: LoginAction) {
		const flow = new DeviceCodeGrantFlow();
		this.authProvider = await flow.login();

		// start receiving thread so we don't await this call.
		this.startReceiveThread(action.channel);
	}

	public async send(action: SendAction): Promise<Field> {
		// not yet logged-in.
		if (!this.channel || !this.chatClient) {
			return undefined;
		}

		await this.chatClient.say(this.channel, action.args.message);
		return undefined;
	}

	emit(data: Field) {
		for (const emitter of this.emitters) {
			emitter.emit(data);
		}
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
