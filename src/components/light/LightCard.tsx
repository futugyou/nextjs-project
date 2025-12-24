
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
            >
                <div className="bg-white/20 p-4 w-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white">Current Light</p>
                        </div>
                        {item.is_on ? <LightOn /> : <LightOff />}
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                        <div className="text-3xl font-bold text-white">
                            <span className="">{item.id}</span>
                            <span className="text-sm text-white/50">
                                {item.name}
                            </span>
                        </div>
                        <div className="text-sm text-white capitalize">{item.is_on ? "on" : "off"}</div>
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