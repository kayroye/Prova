import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ApiHistory } from "@/components/dashboard/api-history";
import authOptions from "@/app/api/auth/authOptions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "API History - TalkToAPI",
  description: "View your API interaction history",
};

export default async function APIHistory() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch API logs
  const supabase = createClient();
  const { data: logs } = await supabase
    .from("api_logs")
    .select(
      `
      id,
      endpoint_id,
      status,
      request,
      response,
      error,
      created_at,
      method,
      api_endpoints!inner (
        url,
        parameters
      )
    `
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  // Convert API logs to the format expected by ApiHistory component
  const apiCalls = (logs || []).map((log) => ({
    id: log.id,
    endpoints: [
      {
        id: log.endpoint_id,
        url: (log.api_endpoints as unknown as { url: string; parameters: Record<string, unknown> }).url,
        parameters: log.request,
      },
    ],
    status: log.status,
    timestamp: new Date(log.created_at),
    error: log.error,
    response: log.response,
    method: log.method,
  }));

  return (
    <div className="flex-1">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold mb-6">API History</h1>
          <ApiHistory calls={apiCalls} />
        </div>
      </main>
    </div>
  );
}
