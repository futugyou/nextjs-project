
import LightCard from "@/components/light/LightCard";
import type { GetLightsToolResult } from "@/components/light/LightCard";

const LightCardContainer = ({ result, status }: { result: any; status: string }) => {
    if (status !== "complete") {
        return (
            <div className="bg-[#667eea] text-white p-4 rounded-lg max-w-md">
                <span className="animate-spin">⚙️ Retrieving light...</span>
            </div>
        );
    }

    const lightResult: GetLightsToolResult = {
        items: result?.items || [],
    };

    return <LightCard result={lightResult} status={status} />;
};


export default LightCardContainer;