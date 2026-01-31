import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime"
import { HttpAgent, AbstractAgent } from "@ag-ui/client"
import { NextRequest } from "next/server"

const buildUrl = (base: string, path: string): string => {
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  const cleanPath = path.startsWith('/') ? path : '/' + path
  return cleanBase + cleanPath
}

// 1. You can use any service adapter here for multi-agent support. We use
//    the empty adapter since we're only using one agent.
const serviceAdapter = new ExperimentalEmptyAdapter()

// 2. Create the CopilotRuntime instance and utilize the Microsoft Agent Framework
//    AG-UI integration to setup the connection.
const createCopilotRuntime = (id: string) => {
  return new CopilotRuntime({
    agents: {
      [id]: new HttpAgent({ url: buildUrl(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000", id), agentId: id }),
    } as any,
  })
}

// 3. Build a Next.js API route that handles the CopilotKit runtime requests.
export const POST = async (req: NextRequest, ctx: RouteContext<'/api/copilotkit/[agent_id]'>) => {
  let { agent_id } = await ctx.params
  const runtime = createCopilotRuntime(agent_id)
  const myAgent = (await runtime.params?.agents as unknown as Record<string, AbstractAgent>)[agent_id];
  console.log(myAgent.agentId)

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: `/api/copilotkit/${agent_id}`,
  })
  return handleRequest(req)
}