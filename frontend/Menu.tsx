import clsx from "clsx";
import { type FC, useContext, useState } from "react";
import useSWRMutation from "swr/mutation";
import { Link } from "wouter";
import { AlertContext } from "./Alert";
import { fetcher } from "./fetcher";

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

const PostButton: FC<{ children: React.ReactNode, url: string }> = ({ url, children }) => {
  const { pushAlert } = useContext(AlertContext);
  const { trigger, isMutating } = useSWRMutation(url, fetcher.post, {
    onError: (err) => pushAlert(err.message, "error"),
  });

  return (
    <button
      type="button"
      className={clsx(isMutating && "loading loading-spinner")}
      onClick={() => trigger()}
      onKeyDown={() => trigger()}
    >
      {children}
    </button>
  );
}

const StartButton = () => <PostButton url="/-/api/module/start">Start</PostButton>;
const StopButton = () => <PostButton url="/-/api/module/stop">Stop</PostButton>;
const SaveButton = () => <PostButton url="/-/api/module/save">Save</PostButton>;

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
