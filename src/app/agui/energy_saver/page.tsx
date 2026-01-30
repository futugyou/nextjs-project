"use client"

import { useState } from "react"
import {
  useHumanInTheLoop,
  useRenderToolCall,
  useCopilotChatSuggestions,
  useCoAgentStateRender,
} from "@copilotkit/react-core"
import { CopilotChat } from "@copilotkit/react-ui"

const EnergySaverChat = () => {

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
              title: "Prompt trigger `Thought` with low probability",
              message: "Based on the current energy consumption, how can I reduce the total power consumption by half? Please thoroughly assess the status of all lights before taking any action.",
            },
            {
              title: "Prompt trigger `Thought` with high probability",
              message: "The current power load is very high. Please first check the status of all the lights. If both the 'living room chandelier' and the 'study desk lamp' are on, to prevent a power outage, please turn off only the light with the highest power consumption. If only one light is on, maintain the current state. Please consider your actions carefully before proceeding.",
            },
          ]}
        />
      </div>
    </div>
  )
}

export default EnergySaverChat