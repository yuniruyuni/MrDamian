import { parse, EvalAstFactory } from 'jexpr';

export type Parameters = {
  [key: string]: (Parameters | Array<Parameters> | string | number | boolean | undefined);
};

export type Environment = {
  [key: string]: (Environment | Array<Environment> | string | number | boolean | undefined);
};

export function evaluate<T extends Parameters>(target: T, envs: Environment): Environment {
  return Object.fromEntries(Object.entries(target).map(([key, val]) => {
    if(typeof val !== "string") return [key, val];
    if( key === "type" ) return [key, val];

    // check if it's an expression.
    if( val.length === 0 ) return [key, val];
    if( val[0] !== "$" ) return [key, val];
    if( val[0] === "$" && val[1] !== "$" ) {
      return [key, val.slice(1)];
    }

    const code = val.slice(1);
    const astFactory = new EvalAstFactory();
    const expr = parse(code, astFactory);
    // TODO: follow up the evaluate result was invalid case.
    const res = expr?.evaluate(envs);
    return [key, res];
  }));
}