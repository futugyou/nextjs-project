"use client";

import {
  CopilotKit,
  useHumanInTheLoop,
  useLangGraphInterrupt,
} from "@copilotkit/react-core";
import { CopilotChat, CopilotSidebar } from "@copilotkit/react-ui";

import ActionButton from "@/components/ActionButton";

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