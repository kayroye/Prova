import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@/lib/supabase/server";
import authOptions from "@/app/api/auth/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createClient();

  try {
    const { data: logs, error } = await supabase
      .from("api_logs")
      .select(`
        *,
        api_endpoints (
          url,
          parameters
        )
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching API logs:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch API logs",
      { status: 500 }
    );
  }
} 