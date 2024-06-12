import { dirname } from "path";
import { parse } from "jsonc";
import fs from 'fs/promises';

import {
  type ComponentConfig,
  type ModuleConfig,
  type PipelineConfig,
  type CallConfig,
} from "./schema";

export const ConfigParseError = new Error("Failed to parse config file");

export async function loadModuleConfig(path: string): Promise<ModuleConfig> {
  const content = await fs.readFile(path, {encoding: 'utf-8'});
  const config = parse(content) as ModuleConfig;
  config.pipeline = await loadPipelineConfig(path, config.pipeline);

  return config;
}

async function loadPipelineConfig(
  path: string,
  config: PipelineConfig,
): Promise<PipelineConfig> {
  return await Promise.all(config.map(async (comp) => {
    return await loadComponentConfig(path, comp);
  }));
}

async function loadComponentConfig(
  path: string,
  config: ComponentConfig,
): Promise<ComponentConfig> {
  if (config.type === "call") {
    const base_dir = dirname(path);
    const mpath = `${base_dir}/${config.path}`;
    const mconfig = await loadModuleConfig(mpath);
    (config as CallConfig).module = mconfig;
  }
  return config;
}
