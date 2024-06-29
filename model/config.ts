import type { Arguments, Parameters } from "./variable";

export type ModuleConfig = {
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
  // "height" field is a height of display area for component.
  // this size iframe will be acquired on component rendering in main screen.
  // if this field is not defined, default is auto calculated from component implementation.
  height?: number;
};

export type SubmoduleConfig = ComponentConfig & {
  // "path" field is a path to module file.
  // All modules are defined as json5 files.
  path: string;
  module: ModuleConfig;
};

export function isSubmoduleConfig(config: ComponentConfig): config is SubmoduleConfig {
  if( config.type !== "submodule" ) return false;
  return (config as SubmoduleConfig).path !== undefined;
}