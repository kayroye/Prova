"use client";

import { useState } from "react";
import { ApiManagement } from "./api-management";
import { DashboardContent } from "./dashboard-content";
import { useToast } from "@/hooks/use-toast";

// Type for stored endpoints from the API
interface StoredEndpoint {
  id: string;
  url: string;
  parameters: string | null;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

// Type for chat interface endpoints
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

export function DashboardWrapper() {
  const [apiCalls, setApiCalls] = useState<APICall[]>([]);
  const [selectedEndpoints, setSelectedEndpoints] = useState<ChatEndpoint[]>([]);
  const { toast } = useToast();

  const handleStartChat = async (endpoints: StoredEndpoint[]) => {
    const callId = crypto.randomUUID();
    
    // Convert stored endpoints to chat endpoints
    const chatEndpoints: ChatEndpoint[] = endpoints.map(e => ({
      id: e.id,
      url: e.url,
      parameters: e.parameters || undefined
    }));
    
    // Add to API call history
    const apiCall: APICall = {
      id: callId,
      endpoints: chatEndpoints,
      status: "pending",
      timestamp: new Date(),
    };
    setApiCalls((prev) => [apiCall, ...prev]);
    setSelectedEndpoints(chatEndpoints);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoints: chatEndpoints }),
      });

      if (!response.ok) {
        throw new Error("Failed to process request");
      }

      // Update API call history
      setApiCalls((prev) =>
        prev.map((call) =>
          call.id === callId
            ? { ...call, status: "success" }
            : call
        )
      );

      toast({
        title: "Chat Started",
        description: "You can now interact with your API through the chat interface.",
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      // Update API call history with error
      setApiCalls((prev) =>
        prev.map((call) =>
          call.id === callId
            ? {
                ...call,
                status: "error",
                error: error.message,
              }
            : call
        )
      );

      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4">
        <ApiManagement onStartChat={handleStartChat} />
      </div>
      <div className="lg:col-span-8">
        <DashboardContent 
          apiCalls={apiCalls}
          selectedEndpoints={selectedEndpoints}
        />
      </div>
    </div>
  );
} 