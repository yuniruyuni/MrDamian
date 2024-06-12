import { JsonValue } from "jsonc";

export type ModuleConfig = {
  args: Record<string, string>;
  pipeline: PipelineConfig;
};

export type PipelineConfig = ComponentConfig[];

export type ComponentConfig = {
  type: string;
  name?: string;
  [key: string]: string | undefined;
};

export type CallConfig = ComponentConfig & {
  path: string;
  module: ModuleConfig;
};