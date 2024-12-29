import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@/lib/supabase/server";
import authOptions from "@/app/api/auth/authOptions";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createClient();

  try {
    const { endpoints } = await request.json();

    if (!Array.isArray(endpoints)) {
      return new NextResponse("Invalid endpoints format", { status: 400 });
    }

    // Create a new chat session
    const chatSessionId = uuidv4();
    const now = new Date().toISOString();
    const { error: sessionError } = await supabase
      .from("chat_sessions")
      .insert({
        id: chatSessionId,
        user_id: session.user.id,
        endpoints: endpoints,
        created_at: now,
        updated_at: now
      });

    if (sessionError) {
      return new NextResponse("Failed to create chat session", { status: 500 });
    }

    // Create initial message
    const initialMessage = `Hello! I see you've provided ${endpoints.length} API endpoint${
      endpoints.length > 1 ? "s" : ""
    }. How would you like to interact with ${
      endpoints.length > 1 ? "them" : "it"
    }?`;

    const { error: messageError } = await supabase
      .from("chat_messages")
      .insert({
        chat_session_id: chatSessionId,
        sender: "ai",
        message: initialMessage,
        created_at: now,
        updated_at: now
      });

    if (messageError) {
      return new NextResponse("Failed to create initial message", { status: 500 });
    }

    return NextResponse.json({
      chatSessionId,
      message: initialMessage,
    });
  } catch (error) {
    console.error("Error creating chat session:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "An error occurred",
      { status: 500 }
    );
  }
} 