import clsx from "clsx";
import type { FC } from "react";
import type { ComponentConfig, ModuleConfig } from "~/model/parameters";
import type { Environment, Field } from "~/model/variable";

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

const Component: FC<{ config: ComponentConfig }> = ({ config }) => (
  <div className="timeline-end timeline-box w-full">
    <h2 className="font-medium text-lg">{config.type}</h2>
    <iframe
      className={clsx("w-full", "overflow-auto")}
      src={`/${[config.type, config.name].filter((v) => v).join("/")}/`}
      title={`${config.type} settings`}
      height={config.height}
    />
  </div>
);

export const Modules: FC<{ modules: ModuleConfig }> = ({ modules }) => (
  <ul className="timeline timeline-vertical timeline-compact">
    {modules.pipeline.map((comp, index) => (
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
        <Component config={comp} />
        {index !== modules.pipeline.length - 1 && <hr />}
      </li>
    ))}
  </ul>
);
