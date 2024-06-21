import type { FC } from "react";

export const Menu: FC = () => (
  <div className="navbar w-full bg-base-100">
    <div className="flex-1">
      <h1 className="btn btn-ghost text-xl">Mr.Damian</h1>
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
