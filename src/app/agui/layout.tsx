"use client"

import "./style.css"
import "@copilotkit/react-ui/styles.css"

import { usePathname } from 'next/navigation'

import { CopilotKit } from "@copilotkit/react-core"
import CopilotStatus from "@/components/CopilotStatus"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pathSegment = pathname.split('/')[2]

  return (
    <CopilotKit
      runtimeUrl={`/api/copilotkit/${pathSegment}`}
      agent={pathSegment}
      publicLicenseKey={process.env.NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY}
    >
      <CopilotStatus agentId={pathSegment}></CopilotStatus>
      {children}
    </CopilotKit>
  )
}