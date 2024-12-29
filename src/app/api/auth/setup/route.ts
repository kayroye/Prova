import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // Create default chat session
    const { error: chatError } = await supabase
      .from("chat_sessions")
      .insert([
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
    const { email, password, name, provider, providerAccountId, avatarUrl } = await req.json()

    if (!email || !password || !name || !provider || !providerAccountId) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Create the user in Supabase Auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        avatar_url: avatarUrl,
        provider
      },
    })

    if (createError) {
      console.error("Error creating user:", createError)
      return new NextResponse(createError.message, { status: 400 })
    }

    // Initialize user tables
    await initializeUserTables(newUser.user.id)

    // Add OAuth provider connection
    const { error: oauthError } = await supabase
      .from("oauth_accounts")
      .insert({
        user_id: newUser.user.id,
        provider: provider.toLowerCase(),
        provider_account_id: providerAccountId,
        created_at: new Date().toISOString(),
      })

    if (oauthError) {
      console.error("Error adding OAuth connection:", oauthError)
      throw oauthError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in setup:", error)
    return new NextResponse(error instanceof Error ? error.message : "Internal Server Error", { 
      status: 500 
    })
  }
} 