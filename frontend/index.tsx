import type { FC } from "react";
import React from "react";
import ReactDOM from "react-dom/client";
import { Redirect, Route, Router } from "wouter";

import { AlertProvider, AlertRegion } from "./Alert";
import { Menu } from "./Menu";
import { Modules } from "./Modules";
import { Plugins } from "./Plugins";

const Container: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="md:container md:mx-auto">{children}</div>
);

const Routing: FC = () => (
  <Router base="/-">
    <Route path="/">
      <Redirect to="/modules" />
    </Route>
    <Route path="/modules">
      <Modules />
    </Route>
    <Route path="/plugins">
      <Plugins />
    </Route>
  </Router>
);

const rootElm = document.getElementById("root");
if (!rootElm) throw new Error("Failed to get root element");
const root = ReactDOM.createRoot(rootElm);
root.render(
  <React.StrictMode>
    <AlertProvider>
      <AlertRegion />
      <Container>
        <Menu />
        <Routing />
      </Container>
    </AlertProvider>
  </React.StrictMode>,
);
