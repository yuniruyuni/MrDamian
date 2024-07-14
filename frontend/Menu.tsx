import { type FC, useState } from "react";
import { Link } from "wouter";

const Details: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <details
      open={open}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="absolute w-full h-full" />
      {children}
    </details>
  );
};

const StartButton = () => {
  return (
    <button
      type="button"
      onClick={() => fetch("/-/api/module/start", { method: "POST" })}
      onKeyDown={() => fetch("/-/api/module/start", { method: "POST" })}
    >
      Start
    </button>
  );
}

const StopButton = () => {
  return (
    <button
      type="button"
      onClick={() => fetch("/-/api/module/stop", { method: "POST" })}
      onKeyDown={() => fetch("/-/api/module/stop", { method: "POST" })}
    >
      Stop
    </button>
  );
}

const SaveButton = () => {
  return (
    <button
      type="button"
      onClick={() => fetch("/-/api/module/save", { method: "POST" })}
      onKeyDown={() => fetch("/-/api/module/save", { method: "POST" })}
    >
      Save
    </button>
  );
}

export const Menu: FC = () => (
  <div className="navbar w-full bg-base-100">
    <div className="flex-1">
      <h1 className="btn btn-ghost text-xl">
        <Link to="/-/modules">Mr.Damian</Link>
      </h1>
    </div>

    <div className="flex-none">
      <ul className="menu menu-horizontal">
        <li><StartButton /></li>
        <li><StopButton /></li>
        <li className="z-50">
          <Details>
            <summary>Menu</summary>
            <ul>
              <li><StartButton /></li>
              <li><StopButton /></li>
              <li><SaveButton /></li>
              <li><Link to="/-/plugins">Plugins</Link></li>
            </ul>
          </Details>
        </li>
      </ul>
    </div>
  </div>
);
