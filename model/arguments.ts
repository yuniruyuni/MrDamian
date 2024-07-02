import type { Environment } from "mrdamian-plugin";

declare const argumentsSymbol: unique symbol;

// Arguments is a special Environment that contains expression string.
// Expression string a special string starts with "$" and
// it will be evaluated by the evaluate function into the Environment type.
export type Arguments = Environment & { [argumentsSymbol]: never };

export function asArgs(envs: Environment): Arguments {
  return envs as Arguments;
}
