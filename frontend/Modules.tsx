import clsx from "clsx";
import type { ComponentConfig, Environment, Field } from "mrdamian-plugin";
import { type FC, useEffect, useState } from "react";
import { Link, Route } from "wouter";
import { type ModuleConfig, asParams } from "~/model/config";


const Config: FC<{ args: Environment }> = ({ args }) => (
  <dl className="divide-y divide-gray-100 grid grid-cols-[max-content,1fr] m-1">
    {args &&
      Object.entries(args as Environment).map(([key, value]) => (
        <ShowField key={key} name={key} value={value} />
      ))}
  </dl>
);

const ShowField: FC<{ name: string; value: Field }> = ({ name, value }) => (
  <div key={name} className="contents">
    <dt className="font-medium text-md mr-4">{name}</dt>
    <dl className="text-md">
      {typeof value === "string" && value}
      {typeof value === "number" && value}
      {typeof value === "object" &&
        Array.isArray(value) &&
        value.map(
          // TODO: create unique key without index value.
          (v) => <Config key="" args={v} />,
        )}
      {typeof value === "object" && !Array.isArray(value) && (
        <Config args={value} />
      )}
    </dl>
  </div>
);

const configLink = (config: ComponentConfig)=>{
  if( config.name ) return `/modules/${config.type}/${config.name}`;
  return `/modules/${config.type}/`;
};

const Step: FC<{ config: ComponentConfig, selected: boolean }> = ({ config, selected }) => {
  return (
    <Link
      className={clsx(
        "timeline-end timeline-box w-full",
        selected && "bg-slate-200",
        "transition-transform duration-200 ease-in-out hover:-translate-x-8"
      )}
      to={configLink(config)}
    >
      <h2 className="font-medium text-lg">{config.type}</h2>
    </Link>
  );
};

const Pipeline: FC<{
  pipeline: ComponentConfig[];
  selected?: { type: string; name?: string };
}> = ({ pipeline, selected }) => (
  <ul className="timeline timeline-vertical timeline-compact min-w-fit w-full flex-1 h-full">
    {pipeline.map((comp, index) => (
      // TODO: create unique key without index value.
      <li key={`${comp.type}/${comp.name}/${index}`}>
        {index !== 0 && <hr />}
        <div className="timeline-middle">
          <svg
            role="graphics-symbol"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <Step
          config={comp}
          selected={
            (comp.type === selected?.type) && (comp.name === selected.name)
          }
        />
        {index !== pipeline.length - 1 && <hr />}
      </li>
    ))}
  </ul>
);

const Component: FC<{ component: ComponentConfig }> = ({ component }) => (
  <iframe
    className="w-full h-full overflow-auto"
    src={`/${[component.type, component.name].filter((v) => v).join("/")}/`}
    title={component.type}
  />
);

const ModuleList: FC<{ modules: ModuleConfig }> = ({ modules }) => (
  <div className="flex flex-row gap-4 h-full">
    <Route path="/modules/:type?/:name?">
      {({ type, name }) => (
        <Pipeline pipeline={modules.pipeline} selected={type ? { type, name } : undefined} />
      )}
    </Route>

    <Route path="/modules/:type/:name?">
      {({ type, name }) => {
        const comp = modules.pipeline.find(
          (comp) => comp.type === type && comp.name === name,
        );
        if (!comp) return;

        return <Component component={comp} />;
      }}
    </Route>
  </div>
);


export const Modules: FC = () => {
  const [modules, setModules] = useState<ModuleConfig>({
    params: asParams({}),
    pipeline: [],
    inherit: {},
  });

  useEffect(() => {
    (async () => {
      const res = await fetch("/-/api/module");
      const json = await res.json();
      setModules(json as ModuleConfig);
    })();
  }, []);

  return (<ModuleList modules={modules} />);
};