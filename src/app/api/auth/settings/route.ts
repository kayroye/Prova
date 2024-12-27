import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@supabase/supabase-js"
import authOptions from "../authOptions"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get MFA status
    const { data: mfaData } = await supabase
      .from("user_mfa")
      .select("is_enabled")
      .eq("user_id", session.user.id)
      .single()

    // Get connected providers from oauth_accounts table
    const { data: oauthData, error: oauthError } = await supabase
      .from("oauth_accounts")
      .select("provider")
      .eq("user_id", session.user.id)

    console.log("OAuth accounts query result:", {
      data: oauthData,
      error: oauthError,
      userId: session.user.id
    });

    const connectedProviders = (oauthData?.map(account => account.provider) || []).map(p => p.toLowerCase());
    console.log("Processed connected providers:", connectedProviders);
    
    return NextResponse.json({
      mfaEnabled: mfaData?.is_enabled || false,
      connectedProviders
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 