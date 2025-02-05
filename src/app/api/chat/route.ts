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
  free: 15, // 15 calls per day
  premium: 300, // 300 calls per day
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
  const today = new Date().toISOString().split("T")[0];
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

    // Store the user's message first if it exists
    if (chatId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        await supabase.from("chat_messages").insert([
          {
            chat_session_id: chatId,
            sender: "user",
            message: lastMessage.content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      }
    }

    // Get user's API endpoints
    const { data: endpoints } = await supabase
      .from("api_endpoints")
      .select("*")
      .eq("user_id", session.user.id);

    // Create functions array for OpenAI
    const functions =
      endpoints?.map((endpoint) => ({
        name: `call_${endpoint.id}`,
        description: `Call the API endpoint: ${endpoint.url}`,
        parameters: {
          type: "object",
          properties: {
            parameters: {
              type: "string",
              description:
                JSON.stringify(endpoint.parameters) ||
                "Parameters for the API call",
            },
            method: {
              type: "string",
              description: "The HTTP method to use for the API call",
            },
          },
          required: ["parameters"],
        },
      })) || [];

    let chatMessages: ChatCompletionMessageParam[] = [];
    if (!messages || messages.length === 0) {
      chatMessages = [
        {
          role: "system",
          content:
            "You are an AI assistant specialized in interacting with APIs. Your capabilities include:\n1. Understanding and calling user-defined APIs through function calling\n2. Explaining API responses in natural language\n3. Suggesting parameters and helping users interact with their APIs effectively\n4. Maintaining context of the conversation and previous API calls\n\nWhen users provide APIs, you can call them using the provided function calls. Always explain what you're doing and help users understand the responses. If you're not sure about the response, ask the user for clarification. Do not write code, or do anything outside of this scope. You are specifically designed to interact with APIs, test them, and help users understand the responses. Keep your responses concise and to the point, and do not include any additional information or commentary. If the API call returns a link to an image, you can embed it using markdown. If the user ever asks for the response in JSON or otherwise, refer them to the API History tab. Do not include any code in your responses.",
        },
      ];
    } else {
      messages.unshift({
        role: "system",
        content:
          "You are an AI assistant specialized in interacting with APIs. Your capabilities include:\n1. Understanding and calling user-defined APIs through function calling\n2. Explaining API responses in natural language\n3. Suggesting parameters and helping users interact with their APIs effectively\n4. Maintaining context of the conversation and previous API calls\n\nWhen users provide APIs, you can call them using the provided function calls. Always explain what you're doing and help users understand the responses. If you're not sure about the response, ask the user for clarification. Do not write code, or do anything outside of this scope. You are specifically designed to interact with APIs, test them, and help users understand the responses. Keep your responses concise and to the point, and do not include any additional information or commentary. If the API call returns a link to an image, you can embed it using markdown. If the user ever asks for the response in JSON or otherwise, refer them to the API History tab. Do not include any code in your responses.",
      });
      chatMessages = messages as ChatCompletionMessageParam[];
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      functions,
    });

    let responseMessage = completion.choices[0].message;

    // If the AI wants to call an API
    if (responseMessage.function_call) {
      console.log("Function call:", responseMessage.function_call);
      const functionName = responseMessage.function_call.name;
      const endpointId = functionName.replace("call_", "");
      const parameters = JSON.parse(
        responseMessage.function_call.arguments
      ).parameters;
      const method =
        JSON.parse(responseMessage.function_call.arguments).method || "GET";

      // Find the endpoint
      const endpoint = endpoints?.find((e) => e.id === endpointId);
      if (!endpoint) {
        throw new Error("Endpoint not found");
      }

      let apiResponseData;
      let apiResponse;
      let statusCode;
      const now = new Date().toISOString();

      try {
        // Make the actual API call
        let url = endpoint.url;
        if (method === "GET" && parameters) {
          const queryParams = new URLSearchParams(JSON.parse(parameters));
          url = `${url}${
            url.includes("?") ? "&" : "?"
          }${queryParams.toString()}`;
        }

        apiResponse = await fetch(url, {
          method: method,
          body: method !== "GET" ? parameters : undefined,
          headers: {
            "Content-Type": "application/json",
          },
        });
        statusCode = apiResponse.status;

        apiResponseData = await apiResponse.text();

        // Log successful API call
        const { error, data } = await supabase.from("api_logs").insert([
          {
            user_id: session.user.id,
            endpoint_id: endpointId,
            request: parameters,
            response: apiResponseData,
            status: statusCode,
            created_at: now,
            method: method,
          },
        ]);

        console.log("API Log Data:", data, error);

        if (error) {
          console.error("Error logging API call:", error);
          throw error;
        }
      } catch (error) {
        // Log failed API call
        await supabase.from("api_logs").insert([
          {
            user_id: session.user.id,
            endpoint_id: endpointId,
            request: parameters,
            error: error instanceof Error ? error.message : "Unknown error",
            status: statusCode || 500, // Use captured status or default to 500
            created_at: now,
            method: method,
          },
        ]);

        throw error;
      }

      // Add the function result to messages and get AI's interpretation
      const newMessages: ChatCompletionMessageParam[] = [
        ...chatMessages,
        responseMessage,
        {
          role: "function",
          name: responseMessage.function_call.name,
          content: apiResponseData,
        },
      ];

      // Get AI's interpretation of the API response
      const secondCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: newMessages,
      });

      responseMessage = secondCompletion.choices[0].message;

      // Update usage count
      await supabase.rpc("increment_api_usage", {
        p_user_id: session.user.id,
        p_period: today,
      });
    }

    // Store the message in chat_messages
    const now = new Date().toISOString();
    if (chatId) {
      await supabase.from("chat_messages").insert([
        {
          chat_session_id: chatId,
          sender: "ai",
          message: JSON.stringify(responseMessage.content),
          created_at: now,
          updated_at: now,
        },
      ]);
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
