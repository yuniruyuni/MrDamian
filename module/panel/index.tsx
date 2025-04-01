import clsx from "clsx";
import React, { type FC } from "react";
import ReactDOM from "react-dom/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { fetcher } from "./fetcher";
import type { Binding, Panels } from "./model";

function isColorCode(color: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(color);
}

const Button: FC<{
  id: string,
  binding: Binding
}> = ({ id, binding: { cell, current } }) => {
  const { trigger: emitClickEvent } = useSWRMutation("./forms", fetcher.post);
  return (
    <button
      type="button"
      className={
        clsx(
          "btn flex-1 hover:scale-105",
          // current.color === "base" && "", // just ignore "base" case.
          current.color === "info" && "bg-info hover:bg-info",
          current.color === "success" && "bg-success hover:bg-success",
          current.color === "warning" && "bg-warning hover:bg-warning",
          current.color === "error" && "bg-error hover:bg-error",
        )
      }
      style={
        isColorCode(current.color)
          ? { backgroundColor: current.color }
          : {}
      }
      onClick={() => emitClickEvent({ id, name: cell.name })}
    >
      {current.text}
    </button>
  );
};

function window<T,>(size: number, arr: T[]): T[][] {
  const res = [];
  for(let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

const Root: FC = () => {
  const {
    data: panels,
    error,
    isLoading,
  } = useSWR<Panels>("./forms", fetcher.get);

  if (error) return <div>Error: {error.message}</div>;
  if (!panels) return <div>Loading...</div>;
  if (isLoading) return <div>Loading...</div>;

  return Object.entries(panels).map(([id , panel]) => (
    <div key={id} className="relative border border-1 border-slate-200 rounded-xl border-solid bg-base-100 m-4 p-4">
      {panel.name && <h2 className="absolute -top-4 bg-base-100">{panel.name}</h2>}
      {
        window(panel.width, panel.bindings)
          .map((w) =>
            <div key={w[0].cell.name} className="flex flex-row flex-1">
              {w.map((binding) => <Button key={binding.cell.name} id={id} binding={binding} />)}
            </div>
          )
      }
    </div>
  ));
};

const rootElm = document.getElementById("root");
if (!rootElm) throw new Error("Failed to get root element");

const root = ReactDOM.createRoot(rootElm);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
