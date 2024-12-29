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
  
  const { data: endpoints, error } = await supabase
    .from("api_endpoints")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
    return new NextResponse(error.message, { status: 500 });
  }

  return NextResponse.json(endpoints);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createClient();
  
  try {
    const { url, parameters } = await request.json();

    if (!url) {
      return new NextResponse("URL is required", { status: 400 });
    }

    const now = new Date().toISOString();
    const { data: endpoint, error } = await supabase
      .from("api_endpoints")
      .insert([
        {
          user_id: session.user.id,
          url,
          parameters: parameters || null,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single();

    if (error) {
      console.log(error);
      return new NextResponse(error.message, { status: 500 });
    }

    return NextResponse.json(endpoint);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error occurred');
    console.error("Failed to process request:", error);
    return new NextResponse("Invalid request body", { status: 400 });
  }
} 