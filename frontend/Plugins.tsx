import clsx from "clsx";
import type { FC } from "react";
import { useContext } from "react";
import useSWRImmutable from "swr/immutable";
import useSWRMutation from "swr/mutation";
import type { PluginInfo } from "~/model/plugin";
import { AlertContext } from "./Alert";

const fetchWithError = async (url: string, init: RequestInit) => {
  const res = await fetch(url, {
    ...init,
    headers: {
      // this method defautly send json data so we can safely add this header.
      // some usecase(ex: multipart request) may need to remove this header,
      // in such case, user code can specify "Content-Type" in init.headers.
      "Content-Type": "application/json",
      ...init.headers,
      // this method only accept json response so we can safely add this header.
      "Accept": "application/json",
    },
  });
  if( !res.ok ) throw new Error(await res.text());
  return await res.json();
};

const get = (url: string) => fetchWithError(url, { headers: { method: 'GET' } });
const post = <Arg,>(url: string, { arg }: { arg: Arg }) => fetchWithError(url, { method: 'POST', body: JSON.stringify(arg) });

const Plugin: FC<{ plugin: PluginInfo }> = ({ plugin }) => {
  const { pushAlert } = useContext(AlertContext);
  const { trigger: onInstall, error, isMutating } = useSWRMutation(
    '/-/api/plugin',
    post,
    {
      onSuccess: () => pushAlert("Succeeded to install plugin", "success"),
      onError: (err) => pushAlert(err.message, "error"),
    },
  );

  if (error) return <tr>plugin error...</tr>;

  return (
    <tr>
      <th>{plugin.name}</th>
      <td>{plugin.description}</td>
      <td>{plugin.version}</td>
      <td className="flex justify-center">
        {plugin.installed && (
          <button type="button" className="btn btn-disabled">
            Installed
          </button>
        )}
        {!plugin.installed && (
          <button
            type="button"
            className={
              clsx(
                "btn btn-primary",
                "place-content-center",
                isMutating && "loading loading-spinner",
              )
            }
            onClick={() => onInstall({ name: plugin.name })}
          >
            Install
          </button>
        )}
      </td>
    </tr>
  );
};

export const Plugins: FC = () => {
  const { data: plugins, error, isLoading } = useSWRImmutable<PluginInfo[]>('/-/api/plugin', get);

  if( isLoading ) return <div className="overflow-x-auto">Loading...</div>;
  if( error ) return <div className="overflow-x-auto">Error: {error.message}</div>;
  if( !plugins ) return <div className="overflow-x-auto">plugins not found</div>

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Version</th>
        </tr>
        <tbody>
          {plugins.map((plugin) => <Plugin key={plugin.name} plugin={plugin} />)}
        </tbody>
      </table>
    </div>
  );
};
