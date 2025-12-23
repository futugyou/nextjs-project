"use client";

import {
  CopilotKit,
  useHumanInTheLoop,
  useLangGraphInterrupt,
} from "@copilotkit/react-core";
import { CopilotChat, CopilotSidebar } from "@copilotkit/react-ui";

const ActionButton = ({
  variant,
  theme,
  disabled,
  onClick,
  children,
}: {
  variant: "primary" | "secondary" | "success" | "danger";
  theme?: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => {
  const baseClasses = "px-6 py-3 rounded-lg font-semibold transition-all duration-200";
  const enabledClasses = "hover:scale-105 shadow-md hover:shadow-lg";
  const disabledClasses = "opacity-50 cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-lg hover:shadow-xl",
    secondary:
      theme === "dark"
        ? "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500"
        : "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 hover:border-gray-400",
    success:
      "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl",
    danger:
      "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl",
  };

  return (
    <button
      className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses} ${disabled && variant === "secondary"
        ? "bg-gray-200 text-gray-500"
        : disabled && variant === "success"
          ? "bg-gray-400"
          : variantClasses[variant]
        }`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};


export default function Page() {

  useHumanInTheLoop({
    name: "change_state",
    description: "Changes the state of the light",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "the light id",
        required: true,
      },
      {
        name: "is_on",
        type: "boolean",
        description: "light status, `true` means open the light, `false` means close the light",
        required: true,
      },
    ],
    render: ({ args, respond, status }) => {
      if (!respond) return <></>;
      return (
        <div className="flex justify-center gap-4">
          <ActionButton
            variant="secondary"
            disabled={status !== "executing"}
            onClick={() => respond(`DENIED`)}
          >
            <span className="mr-2">✗</span>
            Reject
          </ActionButton>
          <ActionButton
            variant="success"
            disabled={status !== "executing"}
            onClick={() => respond(`APPROVED`)}
          >
            <span className="mr-2">✓</span>
            Confirm
          </ActionButton>
        </div>
      );
    },
  });

  return (
    <div
      className="flex justify-center items-center h-full w-full"
      data-testid="background-container"
    >
      <div className="h-full w-full md:w-8/10 md:h-8/10 rounded-lg">
        <CopilotChat
          className="h-full rounded-2xl max-w-6xl mx-auto"
          labels={{ initial: "Hi, I'm an agent. Want to chat?" }}
          suggestions={[
            {
              title: "get light`s states",
              message: "Get the status of all the lights.",
            },
            {
              title: "Turn off the lights and go to sleep.",
              message: "Turn off all the lights.",
            },
          ]}
        />
      </div>
    </div>
  );
}