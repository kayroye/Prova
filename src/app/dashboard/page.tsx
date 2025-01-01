import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import authOptions from "@/app/api/auth/authOptions";

export const metadata: Metadata = {
  title: "Dashboard - Prova",
  description: "Interact with APIs through natural language",
};

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex-1">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold mb-6">Welcome back, {session.user.name || session.user.email}!</h1>
          <DashboardWrapper />
        </div>
      </main>
    </div>
  );
} 