import type { FC } from "react";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import type { ModuleConfig } from "~/model/parameters";
import { asParams } from "~/model/variable";

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

const Modules: FC<{modules: ModuleConfig}> = ({modules}) => (
  <ul className="timeline timeline-vertical timeline-compact">
    {modules.pipeline.map((comp, index) => (
      <li key={`${comp.type}/${comp.name}`}>
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
        <div className="timeline-end timeline-box">
          {comp.type}
        </div>
        {index !== modules.pipeline.length-1 && <hr />}
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