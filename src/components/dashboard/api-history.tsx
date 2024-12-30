"use client";

import { useState } from "react";

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
  response?: string;
}

interface ApiHistoryProps {
  calls: APICall[];
}

export function ApiHistory({ calls }: ApiHistoryProps) {
  const [expandedCalls, setExpandedCalls] = useState<Set<string>>(new Set());

  const toggleCall = (callId: string) => {
    setExpandedCalls((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(callId)) {
        newSet.delete(callId);
      } else {
        newSet.add(callId);
      }
      return newSet;
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">API Call History</h2>
      <div className="space-y-4">
        {calls.map((call) => (
          <div key={call.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <button 
                  onClick={() => toggleCall(call.id)}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  <span className={`transform transition-transform ${
                    expandedCalls.has(call.id) ? 'rotate-90' : ''
                  }`}>▶</span>
                  <p className="font-medium">
                    {new Date(call.timestamp).toLocaleString()}
                  </p>
                </button>
                {call.endpoints.map((endpoint) => (
                  <div key={endpoint.id} className="space-y-1">
                    <p className="font-medium text-sm">{endpoint.url}</p>
                    {expandedCalls.has(call.id) && (
                      <>
                        {call.response && (
                          <div className="text-sm space-y-1">
                            <p className="text-muted-foreground font-medium">Response:</p>
                            <div className="max-w-full">
                              <pre className="bg-muted p-2 rounded-md whitespace-pre-wrap break-words">
                                <code className="block">
                                  {call.response}
                                </code>
                              </pre>
                            </div>
                          </div>
                        )}
                        {endpoint.parameters && (
                          <div className="text-sm space-y-1">
                            <p className="text-muted-foreground font-medium">Request:</p>
                            <div className="max-w-full">
                              <pre className="bg-muted p-2 rounded-md whitespace-pre-wrap break-words">
                                <code className="block">
                                  {endpoint.parameters}
                                </code>
                              </pre>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  call.status === "success"
                    ? "bg-green-100 text-green-800"
                    : call.status === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {call.status}
              </span>
            </div>
            {call.error && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Error:</p>
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                  {call.error}
                </p>
              </div>
            )}
          </div>
        ))}
        {calls.length === 0 && (
          <p className="text-center text-muted-foreground">No API calls yet</p>
        )}
      </div>
    </div>
  );
} 