import type { Action, Component, Field } from "module/lib";

import {
	type SourceLanguageCode,
	type TargetLanguageCode,
	Translator,
} from "deepl-node";

type InitAction = {
	action: "init" | "" | undefined;
	apikey: string;
};

function isInitAction(
	action: DeepLAction,
): action is Action & InitAction {
	if (action.action === undefined) return true;
	if (action.action === "") return true;
	if (action.action === "init") return true;
	return false;
}

type TranslateAction = {
	action: "translate";
	args: {
		message: string;
		source?: string;
		target: string;
	};
};

type DeepLAction = Action & (InitAction | TranslateAction);

export default class DeepL implements Component<DeepLAction> {
	translator?: Translator;
	async initialize(action: DeepLAction): Promise<void> {
		if (isInitAction(action)) {
			this.translator = new Translator(action.apikey);
		}
		return undefined;
	}

	async process(action: DeepLAction): Promise<Field> {
		switch (action.action) {
			case "translate":
				return await this.translate(action);
		}
		return undefined;
	}

	async finalize(_action: DeepLAction): Promise<void> {
		this.translator = undefined;
	}

	async translate(action: TranslateAction): Promise<Field> {
		if (!this.translator) return undefined;
		const results = await this.translator.translateText(
			action.args.message,
			action.args.source ? (action.args.source as SourceLanguageCode) : null,
			action.args.target as TargetLanguageCode,
		);
		return {
			source_lang: results.detectedSourceLang,
			target_lang: action.args.target,
			text: results.text,
		};
	}
}
