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
  status: number;
  timestamp: Date;
  error?: string;
  response?: string;
  method: string;
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
          <div key={call.id} className="border rounded-lg p-2 sm:p-3 md:p-4">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-2">
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between gap-2">
                  <button 
                    onClick={() => toggleCall(call.id)}
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                  >
                    <span className={`transform transition-transform ${
                      expandedCalls.has(call.id) ? 'rotate-90' : ''
                    }`}>▶</span>
                    <p className="font-medium text-sm sm:text-base">
                      {new Date(call.timestamp).toLocaleString()}
                    </p>
                  </button>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      call.status >= 200 && call.status < 300
                        ? "bg-blue-100 text-blue-800"
                        : call.status >= 400 && call.status < 500
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {call.method?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
                {call.endpoints.map((endpoint) => (
                  <div key={endpoint.id} className="space-y-1 w-full">
                    <p className="font-medium text-sm break-all pr-2">{endpoint.url}</p>
                    {expandedCalls.has(call.id) && (
                      <>
                        {call.response && (
                          <div className="text-sm space-y-1">
                            <p className="text-muted-foreground font-medium">Response:</p>
                            <div className="w-full overflow-x-auto">
                              <pre className="bg-muted p-2 rounded-md whitespace-pre-wrap break-words min-w-0 max-w-full">
                                <code className="block text-xs sm:text-sm">
                                  {call.response}
                                </code>
                              </pre>
                            </div>
                          </div>
                        )}
                        {endpoint.parameters && (
                          <div className="text-sm space-y-1">
                            <p className="text-muted-foreground font-medium">Request:</p>
                            <div className="w-full overflow-x-auto">
                              <pre className="bg-muted p-2 rounded-md whitespace-pre-wrap break-words min-w-0 max-w-full">
                                <code className="block text-xs sm:text-sm">
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
            </div>
            {call.error && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Error:</p>
                <div className="w-full overflow-x-auto">
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md whitespace-pre-wrap break-words">
                    {call.error}
                  </p>
                </div>
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