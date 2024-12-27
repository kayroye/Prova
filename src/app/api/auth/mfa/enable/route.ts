import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { enableMFA } from "@/lib/auth/mfa"
import authOptions from "../../authOptions"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId, token } = await req.json()
    if (!token) {
      return new NextResponse("Token is required", { status: 400 })
    }
    if (userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const success = await enableMFA(session.user.id, token)
    if (!success) {
      return new NextResponse("Invalid verification code", { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("MFA enable error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 