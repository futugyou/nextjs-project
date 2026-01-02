"use client";

import { useState } from "react";

import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";

type AgentState = {
  question: string;
  answer: string;
}

const AdkAnswerChat = () => {
  const {
    name,     // The name of the agent currently being used.
    nodeName, // The name of the current LangGraph node.
    state,    // The current state of the agent.
    setState, // A function to update the state of the agent.
    running,  // A boolean indicating if the agent is currently running.
    start,    // A function to start the agent.
    stop,     // A function to stop the agent.
    run,      // A function to re-run the agent. Takes a HintFunction to inform the agent why it is being re-run.
  } = useCoAgent<AgentState>({
    name: "adk_answer",
    initialState: {
      question: "How's the weather in SF?",
      answer: "",
    },
  });

  const askQuestion = (newQuestion: string) => {
    setState({ ...state, question: newQuestion });
  };

  useCoAgentStateRender<AgentState>({
    name: "adk_answer",
    render: ({ state }) => {
      if (!state) return null;

      console.log("answer agnet state", state);

      if (!state.answer || state.answer === "") {
        return (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-blue-700 text-sm font-medium">
                Parsing your request...
              </span>
            </div>
          </div>
        );
        return null;
      }

      return (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-gray-700 text-sm">{state.question}</span>
            </div>
            <span className="text-xs text-gray-500">
              {state.answer}
            </span>
          </div>
        </div>
      );
    },
  });


  return (
    <div>
      <CopilotSidebar
        defaultOpen={true}
        instructions={"You are assisting the user as best as you can. Answer in the best way possible given the data you have."}
        labels={{
          title: "Sidebar Assistant",
          initial: "How can I help you today?",
        }}
      >
        <h1>Q&A Assistant</h1>
        <p><strong>Question:</strong> {state.question}</p>
        <p><strong>Answer:</strong> {state.answer || "Waiting for response..."}</p>
        <button onClick={() => askQuestion("What's the capital of France?")}>
          Ask New Question
        </button>
      </CopilotSidebar>
    </div>
  );
}

export default AdkAnswerChat;