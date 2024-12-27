import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { setupMFA } from "@/lib/auth/mfa"
import authOptions from "../../authOptions"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = await req.json()
    if (userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { secret, backupCodes, otpauthUrl } = await setupMFA(session.user.id)
    
    return NextResponse.json({ secret, backupCodes, otpauthUrl })
  } catch (error) {
    console.error("MFA setup error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 