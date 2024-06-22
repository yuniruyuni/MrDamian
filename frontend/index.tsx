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
      <Plugins />
      <Modules modules={modules} />
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
