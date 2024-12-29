"use client";

import { useState } from "react";
import { ApiForm } from "./api-form";
import { ChatInterface } from "./chat-interface";
import { ApiHistory } from "./api-history";
import { useToast } from "@/hooks/use-toast";

interface FormEndpoint {
  url: string;
  parameters: string;
}

interface Endpoint {
  id: string;
  url: string;
  parameters?: string;
}

interface APICall {
  id: string;
  endpoints: Endpoint[];
  status: string;
  timestamp: Date;
  error?: string;
}

export function DashboardContent() {
  const [apiCalls, setApiCalls] = useState<APICall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleApiSubmit = async (formEndpoints: FormEndpoint[]) => {
    setIsLoading(true);
    const callId = crypto.randomUUID();
    
    // Add to API call history
    const apiCall: APICall = {
      id: callId,
      endpoints: formEndpoints.map(e => ({
        id: crypto.randomUUID(),
        url: e.url,
        parameters: e.parameters || undefined,
      })),
      status: "pending",
      timestamp: new Date(),
    };
    setApiCalls((prev) => [apiCall, ...prev]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoints: formEndpoints }),
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
        title: "Request Successful",
        description: "Your API request was processed successfully.",
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 lg:order-2">
          <ApiForm onSubmit={handleApiSubmit} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-8 lg:order-1">
          <ChatInterface selectedEndpoints={apiCalls[0]?.endpoints} />
        </div>
      </div>
      <div className="rounded-lg border bg-card">
        <ApiHistory calls={apiCalls} />
      </div>
    </div>
  );
} 