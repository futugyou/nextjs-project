"use client";

import { usePathname } from 'next/navigation';

import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import CopilotStatus from "@/components/CopilotStatus";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pathSegment = pathname.split('/')[2];

  return (
    <CopilotKit
      runtimeUrl={`/api/copilotkit/${pathSegment}`}
      agent={pathSegment}
    >
      <CopilotStatus></CopilotStatus>
      {children}
    </CopilotKit>
  );
}