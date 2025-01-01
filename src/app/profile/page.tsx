import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import authOptions from "@/app/api/auth/authOptions";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileInfo from "@/components/profile/profile-info";
import UsageStats from "@/components/profile/usage-stats";

export const metadata: Metadata = {
  title: "Profile - Prova",
  description: "Manage your account settings",
};

async function getUserProfile(userId: string) {
  const supabase = createClient();
  
  const [
    { data: profile },
    { data: usageData }
  ] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("user_id", userId).single(),
    supabase.from("api_usage").select("*").eq("user_id", userId)
  ]);

  return {
    profile,
    usage: usageData || []
  };
}

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userData = await getUserProfile(session.user.id);

  return (
    <div className="flex-1">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session.user.image || undefined} />
              <AvatarFallback>{session.user.name?.[0] || session.user.email?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{session.user.name || session.user.email}</h1>
              <p className="text-muted-foreground">Member since {new Date(userData.profile?.created_at || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="usage">Usage & Subscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <ProfileInfo user={session.user} profile={userData.profile} />
            </TabsContent>
            
            <TabsContent value="usage">
              <UsageStats 
                role={userData.profile?.role}
                usage={userData.usage}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
} 