import fs from "node:fs/promises";
import { dirname } from "node:path";
import JSON5 from "json5";
import {
  type ModuleConfig,
  type PipelineConfig,
  type RawAction,
  type SubmoduleAction,
  isSubmoduleAction,
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
      return await loadAction(path, comp);
    }),
  );
}

async function loadAction(
  path: string,
  config: RawAction,
): Promise<RawAction> {
  if (isSubmoduleAction(config)) {
    const base_dir = dirname(path);
    const mpath = `${base_dir}/${config.path}`;
    const mparams = await loadModuleConfig(mpath);
    (config as SubmoduleAction).module = mparams;
    (config as SubmoduleAction).inherit ||= {};
  }

  if (config.when?.startsWith("$")) {
    console.warn("warning: 'when' condition doesn't need started with '$'.");
  }

  return config;
}
