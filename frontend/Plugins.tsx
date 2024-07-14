import type { FC } from "react";
import { useContext } from "react";
import useSWRImmutable from "swr/immutable";
import useSWRMutation from "swr/mutation";
import type { PluginInfo } from "~/model/plugin";
import { AlertContext } from "./Alert";

export const Plugins: FC = () => {
  const { pushAlert } = useContext(AlertContext);
  const { data: plugins, error, isLoading } = useSWRImmutable<PluginInfo[]>(
    '/-/api/plugin',
    (url: string) => fetch(url).then(res => res.json()),
  );

  const { trigger: onInstall } = useSWRMutation(
    '/-/api/plugin',
    (url: string, { arg }: { arg: string }) => fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: arg }),
    })
    .then(res => res.json())
    .then(res => res.status === "ok" ? res : new Error("Failed to install plugin")),
    {
      onSuccess: () => pushAlert("Succeeded to install plugin", "success"),
      onError: (err) => pushAlert(err.message, "error"),
    },
  );

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
          {plugins.map((plugin) => (
            <tr key={plugin.name}>
              <th>{plugin.name}</th>
              <td>{plugin.description}</td>
              <td>{plugin.version}</td>
              <td>
                {plugin.installed && (
                  <button type="button" className="btn btn-disabled">
                    Installed
                  </button>
                )}
                {!plugin.installed && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => onInstall(plugin.name)}
                  >
                    Install
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
