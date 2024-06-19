import type { FC } from "react";
import ReactDOM from "react-dom";

const Root: FC = () => (
  <div className="container w-full">
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl" href="#title">
          Mr.Damian
        </a>
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
  </div>
);

ReactDOM.render(<Root />, document.getElementById("root"));
