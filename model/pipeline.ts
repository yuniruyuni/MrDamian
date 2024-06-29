import type { Evaluator } from "./evaluator";
import type { ComponentConfig } from "./parameters";

export type Pipeline = Evaluator<ComponentConfig>[];
