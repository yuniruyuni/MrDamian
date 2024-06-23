import type { FC } from "react";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

type Panel = {
  type: "button" | "toggle";
  name: string;
};

const Root: FC = () => {
  const [panels, setPanels] = useState<Panel[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("./panels");
      const json = await res.json();
      setPanels(json as Panel[]);
    })();
  }, []);

  return (
    <div>
      {panels.map((panel) => (
        <button
          type="button"
          key={panel.name}
          className="btn"
        >
          {panel.name}
        </button>
      ))}
    </div>
  );
};

const rootElm = document.getElementById("root");
if (!rootElm) throw new Error("Failed to get root element");

const root = ReactDOM.createRoot(rootElm);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
