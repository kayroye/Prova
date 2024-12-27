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

    // Get MFA settings
    const { data: mfaData } = await supabase
      .from("user_mfa")
      .select("is_enabled")
      .eq("user_id", session.user.id)
      .single()

    return NextResponse.json({
      mfaEnabled: mfaData?.is_enabled || false,
    })
  } catch (error) {
    console.error("Settings fetch error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 