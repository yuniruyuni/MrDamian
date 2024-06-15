import { parse, EvalAstFactory } from 'jexpr';

export type Field =
    | Parameters
    | Array<Parameters>
    | string
    | number
    | boolean
    | undefined;

// Environment is a recursive type that can be used to define a nested object structure.
// Environment contains the evaluated result of the Parameters type.
export type Environment = {
  [key: string]: Field;
};

// Arguments is a recursive type that can be used to define a nested object structure.
// Arguments contains expression string that starts with "$",
// and it will be evaluated by the evaluate function into the Environment type.
export type Arguments = Environment;

// Parameters is a recursive type that can be used to define a nested object structure.
// Parameters contains the valid fields and that default values of a module or a component argument.
// Parameters will filter a Arguments when it's applied to a module/component.
export type Parameters = Environment;

// evaluate function takes two arguments, target and envs.
// target is the Parameters type that contains the expression string that starts with "$".
// envs is the Environment type that contains the evaluated result of the Parameters type.
// evaluate function returns the Environment type that contains the evaluated result of the target.
export function evaluate<T extends Arguments>(
  args: T,
  envs: Environment,
): Environment {
  return Object.fromEntries(
    Object.entries(args ?? {}).map(([key, val]) => {
      if (typeof val === 'object') return [key, evaluate(val as Environment, envs)];
      if (typeof val !== 'string') return [key, val];

      // check if it's an expression.
      if (val.length < 2) return [key, val];
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
