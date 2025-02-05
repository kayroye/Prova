import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@/lib/supabase/server";
import authOptions from "@/app/api/auth/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createClient();

  try {
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (error) throw error;

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
}
