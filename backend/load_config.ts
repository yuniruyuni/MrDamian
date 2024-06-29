import fs from "node:fs/promises";
import { dirname } from "node:path";
import JSON5 from "json5";
import {
  type ComponentConfig,
  type ModuleConfig,
  type PipelineConfig,
  type SubmoduleConfig,
  isSubmoduleConfig,
} from "~/model/config";

export const ConfigParseError = new Error("Failed to parse config file");

export async function load(path: string): Promise<ModuleConfig> {
  const config = await loadModuleConfig(path);
  return config;
}

async function loadModuleConfig(path: string): Promise<ModuleConfig> {
  const content = await fs.readFile(path, { encoding: "utf-8" });
  // TODO: add validation by some schema.
  const config = JSON5.parse(content) as ModuleConfig;
  config.pipeline = await loadPipelineConfig(path, config.pipeline);
  config.inherit ||= {}; // default is empty object.

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
  if (isSubmoduleConfig(config)) {
    const base_dir = dirname(path);
    const mpath = `${base_dir}/${config.path}`;
    const mparams = await loadModuleConfig(mpath);
    (config as SubmoduleConfig).module = mparams;
    (config as SubmoduleConfig).inherit ||= {};
  }
  return config;
}
