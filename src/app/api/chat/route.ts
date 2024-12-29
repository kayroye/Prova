import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@/lib/supabase/server";
import authOptions from "@/app/api/auth/authOptions";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RATE_LIMITS = {
  free: 50,  // 50 calls per day
  premium: 500,  // 500 calls per day
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createClient();

  // Get user's role
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", session.user.id)
    .single();

  const userRole = profile?.role || "free";

  // Check rate limit
  const today = new Date().toISOString().split('T')[0];
  const { data: usage } = await supabase
    .from("api_usage")
    .select("count")
    .eq("user_id", session.user.id)
    .eq("period", today)
    .single();

  const currentCount = usage?.count || 0;
  if (currentCount >= RATE_LIMITS[userRole as keyof typeof RATE_LIMITS]) {
    return new NextResponse("Rate limit exceeded", { status: 429 });
  }

  try {
    const { messages, chatId } = await request.json();

    // Get user's API endpoints
    const { data: endpoints } = await supabase
      .from("api_endpoints")
      .select("*")
      .eq("user_id", session.user.id);

    // Create functions array for OpenAI
    const functions = endpoints?.map((endpoint) => ({
      name: `call_${endpoint.id}`,
      description: `Call the API endpoint: ${endpoint.url}`,
      parameters: {
        type: "object",
        properties: {
          parameters: {
            type: "string",
            description: endpoint.parameters || "Parameters for the API call",
          },
        },
        required: ["parameters"],
      },
    })) || [];

    let chatMessages: ChatCompletionMessageParam[] = [];
    if(!messages || messages.length === 0) {
      chatMessages = [
        {
          role: "system",
          content: "You are an AI assistant specialized in interacting with APIs. Your capabilities include:\n1. Understanding and calling user-defined APIs through function calling\n2. Explaining API responses in natural language\n3. Suggesting parameters and helping users interact with their APIs effectively\n4. Maintaining context of the conversation and previous API calls\n\nWhen users provide APIs, you can call them using the provided function calls. Always explain what you're doing and help users understand the responses. If you're not sure about the response, ask the user for clarification. Do not write code, or do anything outside of this scope. You are specifically designed to interact with APIs, test them, and help users understand the responses. Keep your responses concise and to the point, and do not include any additional information or commentary."
        }
      ];
    } else {
      chatMessages = messages as ChatCompletionMessageParam[];
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      functions,
      function_call: "auto",
    });

    const responseMessage = completion.choices[0].message;

    // If the AI wants to call an API
    if (responseMessage.tool_calls) {
      const functionName = responseMessage.tool_calls[0].function.name;
      const endpointId = functionName.replace("call_", "");
      const parameters = JSON.parse(responseMessage.tool_calls[0].function.arguments).parameters;

      // Find the endpoint
      const endpoint = endpoints?.find(e => e.id === endpointId);
      if (!endpoint) {
        throw new Error("Endpoint not found");
      }

      const now = new Date().toISOString();
      // Log the API call
      await supabase.from("api_logs").insert([{
        user_id: session.user.id,
        endpoint_id: endpointId,
        request: parameters,
        status: "pending",
        created_at: now,
        updated_at: now
      }]);

      // Update usage count
      await supabase.rpc("increment_api_usage", {
        p_user_id: session.user.id,
        p_period: today,
      });
    }

    // Store the message in chat_messages
    const now = new Date().toISOString();
    if (chatId) {
      await supabase.from("chat_messages").insert([{
        chat_session_id: chatId,
        sender: "ai",
        message: JSON.stringify(responseMessage),
        created_at: now,
        updated_at: now
      }]);
    }

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error("Chat error:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "An error occurred",
      { status: 500 }
    );
  }
} 