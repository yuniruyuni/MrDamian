import fs from "node:fs/promises";
import { dirname } from "node:path";
import JSON5 from "json5";

import type { Arguments, Parameters } from "./variable";

export type ModuleConfig = {
  main: boolean;
  params: Parameters;
  pipeline: PipelineConfig;
};

export type PipelineConfig = ComponentConfig[];

export type ComponentConfig = {
  // "type" field is a component type.
  type: string;
  // "name" field is a unique identifier for component instance.
  // this name will be used for assigning result to environment.
  // for example, if a component specified type = "twitch", name = "main",
  // the result value of the component will be assigned to "twitch.main".
  // it means, { "twitch": { "main": ... } } will be merged into current environment.
  name?: string;
  // "when" field is an expression for conditional execution.
  // this expression don't need define with "$" prefix.
  when?: string;
  // "args" field is a list of arguments for component.
  args?: Arguments;
};

export type CallConfig = ComponentConfig & {
  // "path" field is a path to module file.
  // All modules are defined as json5 files.
  path: string;
  module: ModuleConfig;
};

export function isCallConfig(config: ComponentConfig): config is CallConfig {
  return (config as CallConfig).path !== undefined;
}

export const ConfigParseError = new Error("Failed to parse config file");

export async function load(path: string): Promise<ModuleConfig> {
  const config = await loadModuleConfig(path);
  config.main = true;
  return config;
}

async function loadModuleConfig(path: string): Promise<ModuleConfig> {
  const content = await fs.readFile(path, { encoding: "utf-8" });
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
  if (isCallConfig(config)) {
    const base_dir = dirname(path);
    const mpath = `${base_dir}/${config.path}`;
    const mparams = await loadModuleConfig(mpath);
    (config as CallConfig).module = mparams;
  }
  return config;
}
