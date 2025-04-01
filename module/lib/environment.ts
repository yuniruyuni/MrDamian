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
