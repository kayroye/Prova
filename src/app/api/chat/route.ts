import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/authOptions";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { endpoints } = await request.json();

    if (!Array.isArray(endpoints) || endpoints.length === 0) {
      return new NextResponse("Invalid endpoints format", { status: 400 });
    }

    // Store the endpoints in Supabase for this chat session
    const chatSessionId = uuidv4();
    const { error: insertError } = await supabase
      .from("chat_sessions")
      .insert({
        id: chatSessionId,
        user_id: session.user.id,
        endpoints: endpoints,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Error storing chat session:", insertError);
      return new NextResponse("Failed to store chat session", { status: 500 });
    }

    // Return initial chat message
    return NextResponse.json({
      chatSessionId,
      messages: [
        {
          id: uuidv4(),
          role: "assistant",
          content: `Hello! I see you've provided ${endpoints.length} API endpoint${endpoints.length > 1 ? 's' : ''}. How would you like to interact with ${endpoints.length > 1 ? 'them' : 'it'}?`,
          timestamp: new Date(),
        },
      ],
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
} 