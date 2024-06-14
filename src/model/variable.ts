export type ObjectValue = {
  type: "object",
  value: Variables,
};

export type ArrayValue = {
  type: "array",
  value: Value[];
};

export type BooleanValue = {
  type: "boolean",
  value: boolean;
};

export type NumberValue = {
  type: "number",
  value: number;
};

export type StringValue = {
  type: "string",
  value: string;
};

export type ExpressionValue = {
  type: "expression",
  value: string;
};

export type Value =
    | ObjectValue
    | ArrayValue
    | BooleanValue
    | NumberValue
    | StringValue
    | ExpressionValue;

export type Variables = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: Value
};