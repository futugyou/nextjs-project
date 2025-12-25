"use client";

import { useState } from "react";
import {
  CopilotKit,
  useHumanInTheLoop,
  useCopilotAction,
  useFrontendTool
} from "@copilotkit/react-core";
import { CopilotChat, CopilotSidebar } from "@copilotkit/react-ui";

const CodeChat = () => {

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
              title: "feibonaci",
              message: "write a function to calculate the nth fibonacci number",
            },
            {
              title: "double-checked locking",
              message: "Implement double-checked locking in .NET",
            },
          ]}
        />
      </div>
    </div>
  );
}

export default CodeChat;