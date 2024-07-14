import clsx from "clsx";
import type { FC } from "react";
import { useContext } from "react";
import useSWRImmutable from "swr/immutable";
import useSWRMutation from "swr/mutation";
import type { PluginInfo } from "~/model/plugin";
import { AlertContext } from "./Alert";
import { GET, POST } from "./fetcher";

const Plugin: FC<{ plugin: PluginInfo }> = ({ plugin }) => {
  const { pushAlert } = useContext(AlertContext);
  const { trigger: onInstall, error, isMutating } = useSWRMutation(
    '/-/api/plugin',
    POST,
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
  const { data: plugins, error, isLoading } = useSWRImmutable<PluginInfo[]>('/-/api/plugin', GET);

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
