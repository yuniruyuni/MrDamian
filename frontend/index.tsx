import type { FC } from "react";
import ReactDOM from "react-dom";

import { Component } from "./component";
const HomePage: FC = () => (
  <div>
    <Component />
  </div>
);

ReactDOM.render(<HomePage />, document.getElementById("root"));
