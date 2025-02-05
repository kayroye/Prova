import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Endpoint } from "@/lib/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function initializeUserTables(userId: string) {
  const now = new Date().toISOString();

  try {
    // Create user profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert([
        { user_id: userId, role: "free", created_at: now, updated_at: now },
      ]);

    if (profileError) throw profileError;

    // Initialize API usage counters
    const { error: usageError } = await supabase.from("api_usage").insert([
      { user_id: userId, period: "daily", count: 0, updated_at: now },
      { user_id: userId, period: "monthly", count: 0, updated_at: now },
    ]);

    if (usageError) throw usageError;

    // Add example API endpoints
    const exampleEndpoints: Endpoint[] = [
      {
        user_id: userId,
        url: `${process.env.NEXT_PUBLIC_URL}/api/example/8ball`,
        parameters: "{ name: 'question', type: 'string', required: false }",
        created_at: now,
        updated_at: now,
        methods: ["GET"],
        headers: "",
        environment: "development",
        id: crypto.randomUUID(),
        name: "Example Endpoint 1",
        description: "Get a random 8ball question",
        tags: ["fun", "8ball"],
      },
      {
        user_id: userId,
        url: `${process.env.NEXT_PUBLIC_URL}/api/example/funfact`,
        parameters: null,
        created_at: now,
        updated_at: now,
        methods: ["GET"],
        headers: "",
        environment: "development",
        id: crypto.randomUUID(),
        name: "Example Endpoint 2",
        description: "Get a random fun fact",
        tags: ["fun", "fact"],
      },
      {
        user_id: userId,
        url: `${process.env.NEXT_PUBLIC_URL}/api/example/random`,
        parameters:
          "{ name: 'min', type: 'number', required: false }, { name: 'max', type: 'number', required: false }",
        created_at: now,


        updated_at: now,
        methods: ["GET"],
        headers: "",
        environment: "development",
        name: "Example Endpoint 3",
        description: "Get a random number between min and max",
        tags: ["fun", "random"],

        id: crypto.randomUUID(),
      },
      {
        user_id: userId,
        url: `${process.env.NEXT_PUBLIC_URL}/api/example/echo`,
        parameters:
          "{ message: 'string', timestamp: 'number', metadata?: { source: 'string', tags: 'string[]' } }",


        created_at: now,
        updated_at: now,
        methods: ["POST", "PUT"],
        headers: "",
        environment: "development",
        id: crypto.randomUUID(),
        name: "Example Endpoint 4",
        description: "Echo a message",
        tags: ["fun", "echo"],

      },
    ];

    const { error: endpointsError } = await supabase
      .from("api_endpoints")
      .insert(exampleEndpoints);

    if (endpointsError) throw endpointsError;

    // Create default chat session
    const { error: chatError } = await supabase.from("chat_sessions").insert([
      {
        user_id: userId,
        status: "active",
        endpoints: [],
        created_at: now,
        updated_at: now,
      },
    ]);

    if (chatError) throw chatError;
  } catch (error) {
    console.error("Error initializing user tables:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const { email, password, name, provider, providerAccountId, avatarUrl } =
      await req.json();

    // Add more detailed validation
    if (!email || !email.includes("@")) {
      return new NextResponse("Invalid email format", { status: 400 });
    }

    if (!password || password.length < 6) {
      return new NextResponse("Password must be at least 6 characters", {
        status: 400,
      });
    }

    if (!name || !provider || !providerAccountId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Log the attempt (but never log passwords!)
    console.log("Attempting to create user:", {
      email,
      name,
      provider,
      providerAccountId,
    });

    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          avatar_url: avatarUrl,
          provider,
        },
      });

    if (createError) {
      // Log more error details
      console.error("Detailed create error:", {
        message: createError.message,
        status: createError.status,
        name: createError.name,
      });
      return new NextResponse(createError.message, {
        status: createError.status || 400,
      });
    }

    // Initialize user tables
    await initializeUserTables(newUser.user.id);

    // Add OAuth provider connection
    const { error: oauthError } = await supabase.from("oauth_accounts").insert({
      user_id: newUser.user.id,
      provider: provider.toLowerCase(),
      provider_account_id: providerAccountId,
      created_at: new Date().toISOString(),
    });

    if (oauthError) {
      console.error("Error adding OAuth connection:", oauthError);
      throw oauthError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in setup:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      {
        status: 500,
      }
    );
  }
}
