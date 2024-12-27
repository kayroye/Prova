"use client";

import { useState } from "react";
import { ApiForm } from "./api-form";
import { ChatInterface } from "./chat-interface";
import { ApiHistory } from "./api-history";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface APICall {
  id: string;
  endpoints: Array<{url: string, parameters: string}>;
  status: string;
  timestamp: Date;
  error?: string;
}

export function DashboardContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [apiCalls, setApiCalls] = useState<APICall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleApiSubmit = async (endpoints: Array<{url: string, parameters: string}>) => {
    setIsLoading(true);
    const callId = crypto.randomUUID();
    
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: endpoints.map(endpoint => 
        `Endpoint: ${endpoint.url}\nParameters: ${endpoint.parameters}`
      ).join('\n\n'),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add to API call history
    const apiCall: APICall = {
      id: callId,
      endpoints,
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
        body: JSON.stringify({ endpoints }),
      });

      if (!response.ok) {
        throw new Error("Failed to process request");
      }

      const data = await response.json();

      // Update API call history
      setApiCalls((prev) =>
        prev.map((call) =>
          call.id === callId
            ? { ...call, status: "success" }
            : call
        )
      );

      // Add assistant message
      if (data.messages && Array.isArray(data.messages)) {
        data.messages.forEach((message: Message) => {
          setMessages((prev) => [...prev, {
            ...message,
            id: crypto.randomUUID(),
            timestamp: new Date(message.timestamp),
          }]);
        });
      }

      // Show success toast
      toast({
        title: "Request Successful",
        description: "Your API request was processed successfully.",
      });
    } catch (error) {
      // Update API call history with error
      setApiCalls((prev) =>
        prev.map((call) =>
          call.id === callId
            ? {
                ...call,
                status: "error",
                error: error instanceof Error ? error.message : "An error occurred",
              }
            : call
        )
      );

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main interaction area - stacks on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* API Form - Full width on mobile, 4 columns on desktop */}
        <div className="lg:col-span-4 lg:order-2">
          <ApiForm onSubmit={handleApiSubmit} isLoading={isLoading} />
        </div>
        {/* Chat Interface - Full width on mobile, 8 columns on desktop */}
        <div className="lg:col-span-8 lg:order-1">
          <ChatInterface messages={messages} isLoading={isLoading} />
        </div>
      </div>
      {/* API History - Full width */}
      <div className="rounded-lg border bg-card">
        <ApiHistory calls={apiCalls} />
      </div>
    </div>
  );
} 