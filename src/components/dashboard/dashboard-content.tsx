"use client";

import { ChatInterface } from "./chat-interface";
import { ChatEndpoint } from "@/lib/types";
export interface DashboardContentProps {
  selectedEndpoints: ChatEndpoint[];
}

export function DashboardContent({ selectedEndpoints }: DashboardContentProps) {
  return (
    <div className="space-y-6">
      <ChatInterface selectedEndpoints={selectedEndpoints} />
    </div>
  );
} 