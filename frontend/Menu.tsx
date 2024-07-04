import type { FC } from "react";
import { Link } from "wouter";

export const Menu: FC = () => (
  <div className="navbar w-full bg-base-100">
    <div className="flex-1">
      <h1 className="btn btn-ghost text-xl">
        <Link to="/-/modules">Mr.Damian</Link>
      </h1>
    </div>

    <div className="flex-none">
      <ul className="menu menu-horizontal">
        <li>
          <button
            type="button"
            onClick={() => fetch("/api/module/run", { method: "POST" })}
            onKeyDown={() => fetch("/api/module/run", { method: "POST" })}
          >
            Run
          </button>
        </li>
        <li className="z-50">
          <details>
            <summary>Menu</summary>
            <ul>
              <li>
                <button
                  type="button"
                  onClick={() => fetch("/api/module/run", { method: "POST" })}
                  onKeyDown={() => fetch("/api/module/run", { method: "POST" })}
                >
                  Run
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => fetch("/api/module/run", { method: "POST" })}
                  onKeyUp={() => fetch("/api/module/run", { method: "POST" })}
                >
                  Save
                </button>
              </li>
              <li>
                <Link to="/-/plugins">Plugins</Link>
              </li>
            </ul>
          </details>
        </li>
      </ul>
    </div>
  </div>
);
