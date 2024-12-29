import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import authOptions from "@/app/api/auth/authOptions";
import Link from "next/link";
import { Home, History, Settings, User, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard - TalkToAPI",
  description: "Interact with APIs through natural language",
};

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/dashboard/history", icon: History, label: "API History" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch user role from profile
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", session.user.id)
    .single();

  const userRole = profile?.role || "free";
  const roleDisplay = userRole === "premium" ? "Pro" : "Free";
  const roleBadgeVariant = userRole === "premium" ? "default" : "secondary";

  return (
    <div className="flex-1">
      {/* Top Navigation */}
      <nav className="border-b">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary p-2 rounded-md hover:bg-accent"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden sm:inline">
                {session.user.name || session.user.email}
              </span>
              <Badge variant={roleBadgeVariant}>{roleDisplay}</Badge>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold mb-6">Welcome back, {session.user.name || session.user.email}</h1>
          <DashboardWrapper />
        </div>
      </main>
    </div>
  );
} 