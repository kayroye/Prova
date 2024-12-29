"use client";

import { ChatInterface } from "./chat-interface";
import { ApiHistory } from "./api-history";

interface ChatEndpoint {
  id: string;
  url: string;
  parameters?: string;
}

interface APICall {
  id: string;
  endpoints: ChatEndpoint[];
  status: string;
  timestamp: Date;
  error?: string;
}

interface DashboardContentProps {
  apiCalls: APICall[];
  selectedEndpoints: ChatEndpoint[];
}

export function DashboardContent({ 
  apiCalls, 
  selectedEndpoints,
}: DashboardContentProps) {
  return (
    <div className="space-y-6">
      <ChatInterface selectedEndpoints={selectedEndpoints} />
      <div className="rounded-lg border bg-card">
        <ApiHistory calls={apiCalls} />
      </div>
    </div>
  );
} 