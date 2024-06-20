import type { FC } from "react";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import type { ComponentConfig, ModuleConfig } from "~/model/parameters";
import { type Environment, type Field, asParams } from "~/model/variable";

const Container: FC<{children: React.ReactNode}> = ({ children }) => (
  <div className="md:container md:mx-auto">{children}</div>
);

const Menu: FC = () => (
  <div className="navbar w-full bg-base-100">
    <div className="flex-1">
      <h1 className="btn btn-ghost text-xl">
        Mr.Damian
      </h1>
    </div>

    <div className="flex-none">
      <ul className="menu menu-horizontal">
        <li>
          <button
            type="button"
            onClick={() => {
              fetch("/api/module/run", { method: "POST" });
            }}
          >
            Run
          </button>
        </li>
        <li>
          <details>
            <summary>　</summary>
            <ul>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    fetch("/api/module/run", { method: "POST" });
                  }}
                >
                  Run
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    fetch("/api/module/run", { method: "POST" });
                  }}
                >
                  Save
                </button>
              </li>
            </ul>
          </details>
        </li>
      </ul>
    </div>
  </div>
);

const Config: FC<{ args: Environment }> = ({ args }) => (
  <dl className="divide-y divide-gray-100 grid grid-cols-[max-content,1fr] m-1">
    {args &&
      Object.entries(args as Environment).map(([key, value]) => (
        <ShowField key={key} name={key} value={value} />
      ))}
  </dl>
);

const ShowField: FC<{ name: string; value: Field }> = ({ name, value }) => (
  <div key={name} className="contents">
    <dt className="font-medium text-md mr-4">{name}</dt>
    <dl className="text-md">
      {typeof value === "string" && value}
      {typeof value === "number" && value}
      {typeof value === "object" &&
        Array.isArray(value) &&
        value.map(
          // TODO: create unique key without index value.
          (v) => <Config key="" args={v} />
        )
      }
      {typeof value === "object" && !Array.isArray(value) && (
        <Config args={value} />
      )}
    </dl>
  </div>
);

const Component: FC<{ config: ComponentConfig }> = ({ config }) => (
  <div className="timeline-end timeline-box w-full">
    <h2 className="font-medium text-lg">{config.type}</h2>
    <Config args={config} />
  </div>
);

const Modules: FC<{ modules: ModuleConfig }> = ({ modules }) => (
  <ul className="timeline timeline-vertical timeline-compact">
    {modules.pipeline.map((comp, index) => (
      // TODO: create unique key without index value.
      <li key={`${comp.type}/${comp.name}/${index}`}>
        {index !== 0 && <hr />}
        <div className="timeline-middle">
          <svg
            role="graphics-symbol"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <Component config={comp} />
        {index !== modules.pipeline.length - 1 && <hr />}
      </li>
    ))}
  </ul>
);

const Root: FC = () => {
  const [modules, setModules] = useState<ModuleConfig>({
    main: true,
    params: asParams({}),
    pipeline: [],
  });

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/module");
      const json = await res.json();
      setModules(json as ModuleConfig);
    })();
  }, []);

  return (
    <Container>
      <Menu />
      <Modules modules={modules} />
    </Container>
  );
};

const rootElm = document.getElementById("root");
if (!rootElm) throw new Error("Failed to get root element");
const root = ReactDOM.createRoot(rootElm);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);