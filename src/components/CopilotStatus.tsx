import { useCopilotKit } from "@copilotkitnext/react";

const CopilotStatus = () => {
    const { copilotkit } = useCopilotKit();

    const getStatusColor = () => {
        switch (copilotkit.runtimeConnectionStatus) {
            case "Connected":
                return "bg-green-500";
            case "Connecting":
                return "bg-yellow-500";
            case "Error":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    if (copilotkit == null) {
        return (
            <div className={`absolute top-4 right-4 flex items-center space-x-2 p-2 rounded-lg shadow-lg bg-red-500`}>
                <span className="text-white">Error: No CopilotKit</span>
            </div>
        )
    }

    return (
        <div className={`absolute top-4 right-4 flex items-center space-x-2 p-2 rounded-lg shadow-lg ${getStatusColor()}`}>
            <span className="text-white">Runtime: {copilotkit.runtimeConnectionStatus}</span>
            {copilotkit.runtimeVersion && <span className="text-white">v{copilotkit.runtimeVersion}</span>}
        </div>
    );
}

export default CopilotStatus;
