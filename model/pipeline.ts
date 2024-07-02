import type { ComponentConfig } from "mrdamian-plugin";

import type { Evaluator } from "~/model/evaluator";

export type Pipeline = Evaluator<ComponentConfig>[];
