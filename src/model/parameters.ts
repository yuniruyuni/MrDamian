import { dirname } from 'path';
import JSON5 from 'json5';
import fs from 'fs/promises';

import { Parameters, Arguments } from './variable';

export type ModuleConfig = {
  main: boolean;
  params: Parameters;
  pipeline: PipelineConfig;
};

export type PipelineConfig = ComponentConfig[];

export type ComponentConfig = {
  // "type" field is a component type.
  type: string;
  // "name" field is an alias for "type" field.
  // if "name" field is not defined, "type" field is used as "name".
  name?: string;
  // "when" field is an expression for conditional execution.
  // this expression don't need define with "$" prefix.
  when?: string;
  // "args" field is a list of arguments for component.
  args?: Arguments;
}

export type CallConfig = ComponentConfig & {
  // "path" field is a path to module file.
  // All modules are defined as json5 files.
  path: string;
  module: ModuleConfig;
};

export function isCallConfig(config: ComponentConfig): config is CallConfig {
  return (config as CallConfig).path !== undefined;
}

export const ConfigParseError = new Error('Failed to parse config file');

export async function load(path: string): Promise<ModuleConfig> {
  const config = await loadModuleConfig(path);
  config.main = true;
  return config;
}

async function loadModuleConfig(
  path: string,
): Promise<ModuleConfig> {
  const content = await fs.readFile(path, { encoding: 'utf-8' });
  // TODO: add validation by some schema.
  const config = JSON5.parse(content) as ModuleConfig;
  config.main = false;
  config.pipeline = await loadPipelineConfig(path, config.pipeline);

  return config;
}

async function loadPipelineConfig(
  path: string,
  config: PipelineConfig,
): Promise<PipelineConfig> {
  return await Promise.all(
    config.map(async (comp) => {
      return await loadComponentConfig(path, comp);
    }),
  );
}

async function loadComponentConfig(
  path: string,
  config: ComponentConfig,
): Promise<ComponentConfig> {
  // expand default name as type.
  if( config.name === undefined ) {
    config.name = config.type;
  }

  if (isCallConfig(config)) {
    const base_dir = dirname(path);
    const mpath = `${base_dir}/${config.path}`;
    const mparams = await loadModuleConfig(mpath);
    (config as CallConfig).module = mparams;
  }
  return config;
}
