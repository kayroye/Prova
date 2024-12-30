import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@/lib/supabase/server";
import authOptions from "@/app/api/auth/authOptions";

type RouteParams = Promise<{ sessionId: string }>

export async function GET(
  request: Request,
  { params }: { params: RouteParams }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createClient();

  try {
    // Get the sessionId from params asynchronously
    const actualParams = await params;
    const sessionId = actualParams.sessionId;

    // First verify the chat session belongs to the user
    const { data: chatSession } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", session.user.id)
      .single();

    if (!chatSession) {
      return new NextResponse("Chat session not found", { status: 404 });
    }

    // Get all messages for this chat session
    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "An error occurred",
      { status: 500 }
    );
  }
} 