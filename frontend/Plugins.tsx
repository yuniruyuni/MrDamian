import type { FC } from "react";
import { useCallback, useEffect, useState } from "react";
import type { PluginInfo } from "~/model/plugin";
import { Alert } from "./Alert";

export const Plugins: FC = () => {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [message, setAlertMessage] = useState("");
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/plugin");
      const json = await res.json();
      setPlugins(json as PluginInfo[]);
    })();
  });

  const onInstall = useCallback(async (name: string) => {
    const res = await fetch("/api/plugin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (json.status === "ok") {
      setAlertMessage("Succeeded to install plugin");
    } else {
      setAlertMessage("Failed to install plugin");
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setAlertMessage("");
  }, []);

  return (
    <div className="overflow-x-auto">
      {message !== "" && <Alert message={message} />}
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
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onInstall(plugin.name)}
                >
                  Install
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
