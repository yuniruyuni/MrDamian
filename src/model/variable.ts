import { parse, EvalAstFactory } from 'jexpr';

// Parameters is a recursive type that can be used to define a nested object structure.
// Parameters contains expression string that starts with "$",
// and it will be evaluated by the evaluate function into the Environment type.
export type Parameters = {
  [key: string]:
    | Parameters
    | Array<Parameters>
    | string
    | number
    | boolean
    | undefined;
};

// Environment is a recursive type that can be used to define a nested object structure.
// Environment contains the evaluated result of the Parameters type.
export type Environment = {
  [key: string]:
    | Environment
    | Array<Environment>
    | string
    | number
    | boolean
    | undefined;
};

// evaluate function takes two arguments, target and envs.
// target is the Parameters type that contains the expression string that starts with "$".
// envs is the Environment type that contains the evaluated result of the Parameters type.
// evaluate function returns the Environment type that contains the evaluated result of the target.
export function evaluate<T extends Parameters>(
  target: T,
  envs: Environment,
): Environment {
  return Object.fromEntries(
    Object.entries(target).map(([key, val]) => {
      if (typeof val !== 'string') return [key, val];
      if (key === 'type') return [key, val];

      // check if it's an expression.
      if (val.length === 0) return [key, val];
      if (val[0] !== '$') return [key, val];
      if (val[0] === '$' && val[1] === '$') {
        return [key, val.slice(1)];
      }

      const code = val.slice(1);
      const astFactory = new EvalAstFactory();
      const expr = parse(code, astFactory);
      // TODO: follow up the evaluate result was invalid case.
      const res = expr?.evaluate(envs);
      return [key, res];
    }),
  );
}
