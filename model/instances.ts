import type { Component, ComponentConfig } from "mrdamian-plugin";

export type Instances = Map<string, Component<ComponentConfig>>;
export function newInstances(): Instances {
  return new Map();
}