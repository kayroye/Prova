"use client";

import { ChatInterface } from "./chat-interface";

export interface ChatEndpoint {
  id: string;
  url: string;
  parameters?: string;
}

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