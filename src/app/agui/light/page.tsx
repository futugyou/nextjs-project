"use client";

import { CopilotChat, CopilotSidebar } from "@copilotkit/react-ui";

export default function Page() {
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