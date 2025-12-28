
import LightOff from "@/components/light/LightOff";
import LightOn from "@/components/light/LightOn";

export interface GetLightsToolResult {
    items: LightInfo[];
}

export interface LightInfo {
    id: string;
    name: string;
    is_on: boolean;
}

const LightCard = ({ result, status, }: { result: GetLightsToolResult; status: "inProgress" | "executing" | "complete"; }) => {
    const lightItems = result.items.map((item) => {
        return (
            <div
                data-testid="light-card"
                style={{ backgroundColor: "#63B3ED" }}
                className="rounded-xl mt-6 mb-4 max-w-md w-full"
                key={item.id}
            >
                <div className="bg-white/20 p-4 w-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white">{item.id}: {item.name}</p>
                        </div>
                        <div className="text-sm text-white capitalize">{item.is_on ? "on" : "off"}</div>
                        <div className="w-[80px] h-[80px]">
                            {item.is_on ? <LightOn className="w-full h-full object-contain" /> : <LightOff className="w-full h-full object-contain" />}
                        </div>
                    </div>
                </div>
            </div>
        )
    })

    return (
        <div className="space-y-3 mb-6">
            {lightItems}
        </div>
    );
}

export default LightCard;