import type { ComponentConfig } from "./config";
import type { Evaluator } from "./evaluator";

export type Pipeline = Evaluator<ComponentConfig>[];
