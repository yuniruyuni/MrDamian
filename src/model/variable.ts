export type Parameters = {
  [key: string]: (Parameters | Array<Parameters> | string | number | boolean | undefined);
};

export type Environment = {
  [key: string]: (Environment | Array<Environment> | string | number | boolean | undefined);
};
