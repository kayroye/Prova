"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

// Legacy format
interface LegacyAPICall {
  id: string;
  endpoint: string;
  status: string;
  timestamp: Date;
  error?: string;
}

// New format
interface NewAPICall {
  id: string;
  endpoints: Array<{url: string, parameters: string}>;
  status: string;
  timestamp: Date;
  error?: string;
}

type APICall = NewAPICall | LegacyAPICall;

interface ApiHistoryProps {
  calls: APICall[];
}

export function ApiHistory({ calls }: ApiHistoryProps) {
  const [expandedCalls, setExpandedCalls] = useState<Set<string>>(new Set());

  const toggleExpand = (callId: string) => {
    const newExpanded = new Set(expandedCalls);
    if (newExpanded.has(callId)) {
      newExpanded.delete(callId);
    } else {
      newExpanded.add(callId);
    }
    setExpandedCalls(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "pending":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const isNewFormat = (call: APICall): call is NewAPICall => {
    return 'endpoints' in call;
  };

  const getEndpointCount = (call: APICall): number => {
    if (isNewFormat(call)) {
      return call.endpoints.length;
    }
    return 1;
  };

  const getEndpointDisplay = (call: APICall) => {
    const count = getEndpointCount(call);
    return `${count} endpoint${count !== 1 ? 's' : ''}`;
  };

  return (
    <Card className="h-[300px]">
      <CardHeader>
        <CardTitle>Recent API Calls</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full">
          <div className="space-y-4">
            {calls.map((call) => (
              <div
                key={call.id}
                className="p-2 hover:bg-muted rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getEndpointDisplay(call)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(call.timestamp).toLocaleString()}
                    </p>
                    {call.error && (
                      <p className="text-xs text-red-500 truncate">{call.error}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getStatusColor(call.status)}`}>
                      {call.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(call.id)}
                      className="h-8 w-8 p-0"
                    >
                      {expandedCalls.has(call.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {expandedCalls.has(call.id) && (
                  <div className="pl-4 space-y-2 border-l-2">
                    {isNewFormat(call) ? (
                      call.endpoints.map((endpoint, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium truncate">{endpoint.url}</p>
                          {endpoint.parameters && (
                            <p className="text-xs text-muted-foreground truncate">
                              Parameters: {endpoint.parameters}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm">
                        <p className="font-medium truncate">{call.endpoint}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {calls.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No API calls yet
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 