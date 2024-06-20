import { Component } from "../../../model/component";
import type { ComponentConfig } from "../../../model/parameters";
import type { Field } from "../../../model/variable";

import {
  type SourceLanguageCode,
  type TargetLanguageCode,
  Translator,
} from "deepl-node";

type InitConfig = {
  action: "init" | "" | undefined;
  apikey: string;
};

function isInitConfig(
  config: DeepLConfig,
): config is ComponentConfig & InitConfig {
  if (config.action === undefined) return true;
  if (config.action === "") return true;
  if (config.action === "init") return true;
  return false;
}

type DetectConfig = {
  action: "detect";
  args: {
    message: string;
  };
};

type TranslateConfig = {
  action: "translate";
  args: {
    message: string;
    source?: string;
    target: string;
  };
};

type DeepLConfig = ComponentConfig &
  (InitConfig | DetectConfig | TranslateConfig);

export class DeepL extends Component<DeepLConfig> {
  translator?: Translator;
  async init(config: DeepLConfig): Promise<Field> {
    if (isInitConfig(config)) {
      this.translator = new Translator(config.apikey);
    }
    return undefined;
  }

  async run(config: DeepLConfig): Promise<Field> {
    switch (config.action) {
      case "translate":
        return await this.translate(config);
    }
    return undefined;
  }

  async translate(config: TranslateConfig): Promise<Field> {
    if (!this.translator) return undefined;
    const results = await this.translator.translateText(
      config.args.message,
      config.args.source ? (config.args.source as SourceLanguageCode) : null,
      config.args.target as TargetLanguageCode,
    );
    return {
      source_lang: results.detectedSourceLang,
      target_lang: config.args.target,
      text: results.text,
    };
  }
}
