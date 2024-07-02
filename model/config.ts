import type { ComponentConfig, Environment } from "mrdamian-plugin";

import type { Arguments } from "~/model/arguments";

export type RawComponentConfig = ComponentConfig & { args: Arguments };

declare const parametersSymbol: unique symbol;

// Parameters is a recursive type that can be used to define a nested object structure.
// Parameters contains the valid fields and that default values of a module or a component argument.
// Parameters will filter a Arguments when it's applied to a module/component.
export type Parameters = Environment & { [parametersSymbol]: never };

export function asParams(envs: Environment): Parameters {
  return envs as Parameters;
}

export type ModuleConfig = {
  inherit: Inheritance;
  params: Parameters;
  pipeline: PipelineConfig;
};

export type PipelineConfig = RawComponentConfig[];

// Inheritance expresses submodule's component instance inheritance.
type Inheritance = {
  [key: string]: string;
};

export type SubmoduleConfig = ComponentConfig & {
  // "path" field is a path to module file.
  // All modules are defined as json5 files.
  path: string;
  // "inherit" field is an object of inherited copmonent instance name.
  // submodule can use component instances if specified in this field.
  // when event process, specified component's event will be merged into current environment.
  inherit: Inheritance;
  // "module" field is a module's configuration contained with this submodule.
  // this configuration will be used to create a module instance.
  module: ModuleConfig;
};

export function isSubmoduleConfig(
  config: ComponentConfig,
): config is SubmoduleConfig {
  if (config.type !== "submodule") return false;
  return (config as SubmoduleConfig).path !== undefined;
}
