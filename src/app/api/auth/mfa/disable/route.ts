import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@supabase/supabase-js"
import authOptions from "../../authOptions"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Disable MFA
    const { error } = await supabase
      .from("user_mfa")
      .update({ 
        is_enabled: false,
        secret: null,
        backup_codes: [],
      })
      .eq("user_id", session.user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("MFA disable error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 