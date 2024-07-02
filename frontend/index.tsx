import type { FC } from "react";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Route, Switch, useLocation } from "wouter";

import { type ModuleConfig, asParams } from "~/model/config";
import { AlertProvider, AlertRegion } from "./Alert";
import { Menu } from "./Menu";
import { Modules } from "./Modules";
import { Plugins } from "./Plugins";

const Container: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="md:container md:mx-auto">{children}</div>
);

type TabID = "plugins" | "modules";

const useTabs = (defaults: TabID) => {
  const [location, setLocation] = useLocation();
  const [selected, setSelected] = useState(
    location === "/" ? defaults : (location.slice(1) as TabID),
  );
  const onClickTab = (tab: TabID) => {
    setSelected(tab);
    setLocation(`/${tab}`);
  };
  return { selected, onClickTab };
};

const Root: FC = () => {
  const [modules, setModules] = useState<ModuleConfig>({
    params: asParams({}),
    pipeline: [],
    inherit: {},
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
      <Switch>
        <div role="tablist" className="tabs tabs-lifted">
          <input
            type="radio"
            name="modules"
            role="tab"
            className="tab"
            aria-label="modules"
            onClick={() => tabs.onClickTab("modules")}
            onKeyUp={() => tabs.onClickTab("modules")}
            checked={tabs.selected === "modules"}
          />
          <div
            role="tabpanel"
            className="tab-content bg-base-100 border-base-300 rounded-box p-6"
          >
            <Route path={/^\/(modules)?/}>
              <Modules modules={modules} />
            </Route>
          </div>

          <input
            type="radio"
            name="plugins"
            role="tab"
            className="tab"
            aria-label="plugins"
            onClick={() => tabs.onClickTab("plugins")}
            onKeyUp={() => tabs.onClickTab("plugins")}
            checked={tabs.selected === "plugins"}
          />
          <div
            role="tabpanel"
            className="tab-content bg-base-100 border-base-300 rounded-box p-6"
          >
            <Route path="/plugins">
              <Plugins />
            </Route>
          </div>
        </div>
      </Switch>
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
