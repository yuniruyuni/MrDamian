import type { Action } from "mrdamian-plugin";

import type { Evaluator } from "~/model/evaluator";

export type Pipeline = Evaluator<Action>[];
