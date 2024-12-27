import NextAuth from "next-auth";
import authOptions from "@/app/api/auth/authOptions";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    }
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };