"use client";

import { useState } from "react";
import {
  CopilotKit,
  useHumanInTheLoop,
  useCopilotAction,
  useFrontendTool
} from "@copilotkit/react-core";
import { CopilotChat, CopilotSidebar } from "@copilotkit/react-ui";

const MsdocsChat = () => {

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
              title: "create storage account",
              message: "How do I create an Azure storage account using the Azure CLI? Please provide a brief explanation and include a link to the relevant documentation.",
            },
            {
              title: "aspire usage",
              message: "How to use Aspire to organize projects? Please provide a brief explanation and include a link to the relevant documentation.",
            },
            {
              title: "deploy aspire to k8s?",
              message: "How to deploy Aspire project to Kubernetes? Please provide a brief explanation and include a link to the relevant documentation.",
            },
          ]}
        />
      </div>
    </div>
  );
}

export default MsdocsChat;