import {
  ComponentConfig,
  ModuleConfig,
  PipelineConfig,
  CallConfig,
} from "./schema";

// TODO: add validation by some schema.

export async function constructModule(config: ModuleConfig) {
  await constructPipeline(config.pipeline);
}

async function constructPipeline(pipeline: PipelineConfig) {
  await Promise.all(pipeline.map(constructComponent));
}

async function constructComponent(config: ComponentConfig) {
  switch (config.type) {
    case "call":
      await callModule(config);
      break;
    default:
      console.warn("Unsupported component type: " + config.type);
      break;
  }
}

async function callModule(config: ComponentConfig) {
  if (config.type !== "call") return;
  await constructModule((config as CallConfig).module);
}
