import type { FC } from "react";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import type { ModuleConfig } from "~/model/parameters";
import { asParams } from "~/model/variable";
import { AlertProvider, AlertRegion } from "./Alert";
import { Menu } from "./Menu";
import { Modules } from "./Modules";
import { Plugins } from "./Plugins";

const Container: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="md:container md:mx-auto">{children}</div>
);

type TabID = "plugins" | "modules";

const useTabs = (defaults: TabID) => {
  const [selected, setSelected] = useState(defaults);
  const onClickTab = (tab: TabID) => {
    setSelected(tab);
  };
  return {selected, onClickTab};
};

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

  const tabs = useTabs("modules");

  console.log(tabs);

  return (
    <Container>
      <Menu />
      <div role="tablist" className="tabs tabs-lifted">
        <input
          type="radio"
          name="modules"
          role="tab"
          className="tab"
          aria-label="modules tab"
          onClick={() => tabs.onClickTab("modules")}
          onKeyUp={() => tabs.onClickTab("modules")}
          checked={tabs.selected === "modules"}
        />
        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
          <Modules modules={modules} />
        </div>

        <input
          type="radio"
          name="plugins"
          role="tab"
          className="tab"
          aria-label="plugins tab"
          onClick={() => tabs.onClickTab("plugins")}
          onKeyUp={() => tabs.onClickTab("plugins")}
          checked={tabs.selected === "plugins"}
        />
        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
          <Plugins />
        </div>
      </div>
    </Container>
  );
};

const rootElm = document.getElementById("root");
if (!rootElm) throw new Error("Failed to get root element");
const root = ReactDOM.createRoot(rootElm);
root.render(
  <React.StrictMode>
    <AlertProvider>
      <AlertRegion />
      <Root />
    </AlertProvider>
  </React.StrictMode>,
);
