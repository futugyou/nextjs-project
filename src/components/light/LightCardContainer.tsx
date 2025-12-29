
import LightCard from "@/components/light/LightCard";
import type { LightInfo } from "@/components/light/LightCard";

export interface GetLightsToolResult {
    items: LightInfo[];
}

const LightCardContainer = ({ result, status, tip }: { result: GetLightsToolResult; status: string, tip: string }) => {
    if (status !== "complete") {
        return (
            <div className="bg-[#667eea] text-white p-4 rounded-lg max-w-md">
                <span className="animate-spin">⚙️ Retrieving light...</span>
            </div>
        );
    }

    const lightItems = (result.items ?? []).map((item) => {
        return (
            <LightCard item={item} key={item.id}></LightCard>
        )
    })

    return <div className="bg-[#667eea] text-white p-4 rounded-lg max-w-md">
        <div>
            <span className="animate-spin">⚙️ Call from {tip} ...</span>
        </div>
        <div className="space-y-3 mb-6">
            {lightItems}
        </div>
    </div>;
};


export default LightCardContainer;