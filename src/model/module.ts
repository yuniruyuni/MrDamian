import { type ModuleConfig } from './parameters';

import { Environment, Parameters } from './variable';
import { Pipeline } from './pipeline';

export class Module {
  config: ModuleConfig;
  pipeline: Pipeline;

  constructor(config: ModuleConfig, pipeline: Pipeline) {
    this.config = config;
    this.pipeline = pipeline;
  }

  async init(init: Environment): Promise<Environment> {
    return await this.event('init', init);
  }

  async run(init: Environment): Promise<Environment> {
    return await this.event('run', init);
  }

  async event(field: 'init' | 'run', init: Environment): Promise<Environment> {
    const params: Parameters = this.config.params ?? ({} as Parameters);
    // our component have default value as "params" in it's configuration file.
    const filled = { ...params, ...init };
    const filtered = this.config.main
      ? filled
      : Object.fromEntries(
          Object.entries(params).map(([key, _value]) => [key, filled[key]]),
        );

    return await this.pipeline.reduce(async (penv, comp) => {
      const env: Environment = await penv;
      console.log(env);
      const ret = await comp[field](env);
      if (ret === undefined) return env;
      // TODO: split this into some function...(it is as same as component.ts)
      const keys = [comp.config.type, comp.config.name].filter((v) => v);
      let obj = ret;
      for(const key of keys.reverse()) {
        obj = { [key]: obj };
      }
      // TODO: use deep merge.
      return { ...env, ...(obj as Environment) };
    }, Promise.resolve(filtered));
  }
}
