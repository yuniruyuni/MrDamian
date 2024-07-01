// Environment is a recursive type that can be used to define a nested object structure.
// Environment contains the evaluated result of the Parameters type.
export type Environment = {
  [key: string]: Field;
};

// Field is a field type in the Environment.
export type Field =
  | Environment
  | Array<Environment>
  | string
  | number
  | boolean
  | undefined;

declare const argumentsSymbol: unique symbol;

// Arguments is a special Environment that contains expression string.
// Expression string a special string starts with "$" and
// it will be evaluated by the evaluate function into the Environment type.
export type Arguments = Environment & { [argumentsSymbol]: never };

export function asArgs(envs: Environment): Arguments {
  return envs as Arguments;
}