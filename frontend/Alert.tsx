import clsx from "clsx";
import type { FC, ReactNode } from "react";
import { createContext, useContext, useState } from "react";

export type AlertType = "info" | "success" | "warning" | "error";
export type AlertParams = {
  message: string;
  type: AlertType;
  active: boolean;
  onTransitionEnd?: () => void;
};

function toAlertClass(type: AlertType): string {
  switch (type) {
    case "info":
      return "alert-info";
    case "success":
      return "alert-success";
    case "warning":
      return "alert-warning";
    case "error":
      return "alert-error";
  }
}

export const Alert: FC<AlertParams> = ({
  message,
  type,
  active,
  onTransitionEnd,
}) => (
  <div
    role="alert"
    className={clsx(
      "alert",
      toAlertClass(type),
      "transition-all duration-400 ease-in-out",
      "overflow-hidden",
      !active && "opacity-0 h-0 pt-0 pb-0 border-0",
    )}
    onTransitionEnd={onTransitionEnd ?? (() => {})}
  >
    <svg
      role="graphics-symbol"
      xmlns="http://www.w3.org/2000/svg"
      className="stroke-current shrink-0 h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <span>{message}</span>
  </div>
);

export const AlertContext = createContext<{
  actives: { id: number; params: AlertParams }[];
  pushAlert: (message: string, type: AlertType) => void;
}>({
  actives: [],
  pushAlert: () => {},
});

const ALERT_TIME = 3000;
export const AlertProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState({
    count: 0,
    actives: [] as { id: number; params: AlertParams }[],
  });

  const pushAlert = async (message: string, type: AlertType) => {
    const id = state.count + 1;
    setState({
      count: id,
      actives: [
        ...state.actives,
        {
          id,
          params: { message, type, active: true },
        },
      ],
    });

    await new Promise((resolve) => setTimeout(resolve, ALERT_TIME));

    setState((state) => {
      const newobj = {
        count: state.count,
        actives: state.actives.map((a) => {
          if (a.id !== id) return a;
          return {
            ...a,
            params: {
              ...a.params,
              active: false,
              onTransitionEnd: () => {
                setState((state) => ({
                  count: state.count,
                  actives: state.actives.filter((a) => a.id !== id),
                }));
              },
            },
          };
        }),
      };
      return newobj;
    });
  };

  return (
    <AlertContext.Provider value={{ actives: state.actives, pushAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const AlertRegion: FC = () => {
  const context = useContext(AlertContext);

  return (
    <div
      className={clsx(
        "md:container md:mx-auto",
        "inset-x-0",
        "grid gap-1",
        "fixed",
        "z-50",
      )}
    >
      {context.actives.map((a) => (
        <Alert key={a.id} {...a.params} />
      ))}
    </div>
  );
};
