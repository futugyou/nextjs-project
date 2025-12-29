"use client";

import { useState } from "react";
import {
  CopilotKit,
  useHumanInTheLoop,
  useRenderToolCall,
  useFrontendTool
} from "@copilotkit/react-core";
import { CopilotChat, CopilotSidebar } from "@copilotkit/react-ui";

import ActionButton from "@/components/ActionButton";
import LightCardContainer from "@/components/light/LightCardContainer";

const LightChat = () => {
  const [background, setBackground] = useState<string>("--copilot-kit-background-color");

  useFrontendTool({
    name: "change_background",
    description:
      "Change the background color of the chat. Can be anything that the CSS background attribute accepts. Regular colors, linear of radial gradients etc.",
    parameters: [
      {
        name: "background",
        type: "string",
        description: "The background. Prefer gradients. Only use when asked.",
      },
    ],
    handler: ({ background }) => {
      setBackground(background);
      return {
        status: "success",
        message: `Background changed to ${background}`,
      };
    },
  });

  useRenderToolCall({
    name: "get_lights",
    available: "disabled",
    render: (props) => <LightCardContainer result={props.result} status={props.status} tip="useRenderToolCall"/>,
  });

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
      style={{ background }}
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
            {
              title: "Change background",
              message: "Change the background to something new.",
            },
          ]}
        />
      </div>
    </div>
  );
}

export default LightChat;