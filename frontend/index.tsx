import type { FC } from "react";
import ReactDOM from "react-dom";

import { Component } from "./component";
const Root: FC = () => (
  <div>
    <Component />
    <div className="text-3xl font-bold underline">
      hogehoge
    </div>
  </div>
);

ReactDOM.render(<Root />, document.getElementById("root"));
