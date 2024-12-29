import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@/lib/supabase/server";
import authOptions from "@/app/api/auth/authOptions";

type RouteParams = Promise<{ id: string }>

export async function DELETE(
  request: Request,
  { params }: { params: RouteParams }
) {
  const actualParams = await params;
  const id = actualParams.id;
  
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createClient();
  
  // First verify the endpoint belongs to the user
  const { data: endpoint, error: fetchError } = await supabase
    .from("api_endpoints")
    .select("*")
    .eq("id", id)
    .eq("userId", session.user.id)
    .single();

  if (fetchError || !endpoint) {
    return new NextResponse("Endpoint not found", { status: 404 });
  }

  const { error: deleteError } = await supabase
    .from("api_endpoints")
    .delete()
    .eq("id", id)
    .eq("userId", session.user.id);

  if (deleteError) {
    return new NextResponse(deleteError.message, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
} 