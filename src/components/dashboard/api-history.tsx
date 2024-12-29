"use client";

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

interface ApiHistoryProps {
  calls: APICall[];
}

export function ApiHistory({ calls }: ApiHistoryProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">API Call History</h2>
      <div className="space-y-4">
        {calls.map((call) => (
          <div key={call.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {new Date(call.timestamp).toLocaleString()}
                </p>
                <div className="mt-2 space-y-2">
                  {call.endpoints.map((endpoint) => (
                    <div key={endpoint.id} className="text-sm">
                      <p className="font-medium">{endpoint.url}</p>
                      {endpoint.parameters && (
                        <p className="text-muted-foreground">
                          Parameters: {endpoint.parameters}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
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
              <p className="mt-2 text-sm text-red-600">{call.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 