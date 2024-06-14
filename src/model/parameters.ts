import { dirname } from "path";
import JSON5 from "json5";
import fs from 'fs/promises';

import { Parameters } from "./variable";

export type ModuleParameters = {
  args: Record<string, string>;
  pipeline: PipelineParameters;
};

export type PipelineParameters = ComponentParameters[];

export type ComponentParameters = Parameters & {
  type: string;
  name?: string;
};

export type CallParameters = ComponentParameters & {
  path: string;
  module: ModuleParameters;
};

// TODO: add validation by some schema.

export const ParameterParseError = new Error("Failed to parse parameter file");

export async function loadModuleParameters(path: string): Promise<ModuleParameters> {
  const content = await fs.readFile(path, {encoding: 'utf-8'});
  const params = JSON5.parse(content) as ModuleParameters;
  params.pipeline = await loadPipelineParameters(path, params.pipeline);

  return params;
}

async function loadPipelineParameters(
  path: string,
  params: PipelineParameters,
): Promise<PipelineParameters> {
  return await Promise.all(params.map(async (comp) => {
    return await loadComponentParameters(path, comp);
  }));
}

async function loadComponentParameters(
  path: string,
  params: ComponentParameters,
): Promise<ComponentParameters> {
  if (params.type === "call") {
    const base_dir = dirname(path);
    const mpath = `${base_dir}/${params.path}`;
    const mparams = await loadModuleParameters(mpath);
    (params as CallParameters).module = mparams;
  }
  return params;
}
