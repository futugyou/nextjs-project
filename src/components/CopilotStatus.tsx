"use client"
import { useState, useEffect } from "react"
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2"

const getStatusColor = (status: string) => {
    switch (status) {
        case "Connected":
            return "bg-green-500"
        case "Connecting":
            return "bg-yellow-500"
        case "Error":
            return "bg-red-500"
        default:
            return "bg-gray-500"
    }
}

const CopilotStatus = ({ agentId }: { agentId: string }) => {
    const { agent } = useAgent({ agentId: agentId })
    const { copilotkit } = useCopilotKit()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return <div className="absolute top-4 right-4 p-2">Loading...</div>
    }

    if (!copilotkit || !agent) {
        return (
            <div className={`absolute top-4 right-4 flex items-center space-x-2 p-2 rounded-lg shadow-lg bg-red-500`}>
                <span className="text-white">Error: No CopilotKit</span>
            </div>
        )
    }

    return (
        <div className={`absolute top-4 right-4 flex items-center space-x-2 p-2 rounded-lg shadow-lg ${getStatusColor(copilotkit?.runtimeConnectionStatus ?? "")}`}>
            <span className="text-white">Runtime: {copilotkit.runtimeConnectionStatus}</span>
            {copilotkit.runtimeVersion && <span className="text-white">v{copilotkit.runtimeVersion}</span>}
            <span className="text-white">Agent: {agent?.agentId ?? "NoAgent"}</span>
            <span className="text-white">Messages: {agent?.messages?.length ?? 0}</span>
            <span className="text-white">Running: {agent?.isRunning ? "Yes" : "No"}</span>
        </div>
    )
}

export default CopilotStatus
