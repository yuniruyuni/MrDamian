import { type ModuleConfig } from './parameters';

import { Environment } from './variable';
import { Pipeline } from './pipeline';

export class Module {
  config: ModuleConfig;
  pipeline: Pipeline;

  constructor(config: ModuleConfig, pipeline: Pipeline) {
    this.config = config;
    this.pipeline = pipeline;
  }

  async init(init: Environment): Promise<Environment> {
    return await this.event('initRaw', init);
  }

  async run(init: Environment): Promise<Environment> {
    return await this.event('runRaw', init);
  }

  async event(field: 'initRaw' | 'runRaw', init: Environment): Promise<Environment> {
    const params = this.config.params ?? {};
    // our component have default value as "params" in it's configuration file.
    const filled = { ...params, ...init };
    const filtered = this.config.main
      ? filled
      : Object.fromEntries(
        Object.entries(params).map(([key, _value]) => [key, filled[key]])
      );

    return await this.pipeline.reduce(async (penv, comp) => {
      const env: Environment = await penv;
      console.log(env);
      const ret = await comp[field](env);
      if ( ret === undefined ) return env;
      return { ...env, [comp.config.name]: ret };
    }, Promise.resolve(filtered));
  }
}
