import type { Field } from "./environment";

// path for a submodule that current component action mounted.
// for each inherit call, submodule identifier is stacked with slash.
// empty string is default emitter, and this is equivalent to the module where the component was first instantiated.
export type Path = number;

export const Path = {
  // root is the path for the root module.
  // In this case, Root means the module where the component was first instantiated.
  root: -1,
  // local is the path for the current module.
  local: 0,
  // parent is the path for the parent module.
  parent: 1,
  // You can specify any n-parent path by using a positive integer.
} as const;

// EventEmitter is an interface that can be used to emit events to the pipeline.
export interface EventEmitter {
  // emit event to local.
  emit(event: Field): void;
  // emit event to specified path.
  emit(event: Field, path: Path): void;
}
