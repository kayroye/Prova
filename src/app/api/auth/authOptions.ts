import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: "public",
    },
  }
);

async function initializeUserTables(userId: string) {
  const now = new Date().toISOString();

  console.log("Starting initializeUserTables for userId:", userId);

  try {
    // Create user profile
    console.log("Attempting to create user profile...");
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .insert([
        { user_id: userId, role: "free", created_at: now, updated_at: now },
      ])
      .select();

    console.log("Profile creation result:", {
      data: profileData,
      error: profileError,
    });

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    // Initialize API usage counters
    const { error: usageError } = await supabase.from("api_usage").insert([
      { user_id: userId, period: "daily", count: 0, updated_at: now },
      { user_id: userId, period: "monthly", count: 0, updated_at: now },
    ]);

    if (usageError) {
      console.error("Error initializing API usage:", usageError);
      throw new Error(`Failed to initialize API usage: ${usageError.message}`);
    }

    // Create default chat session
    const { error: chatError } = await supabase
      .from("chat_sessions")
      .insert([
        {
          user_id: userId,
          status: "active",
          endpoints: [],
          created_at: now,
          updated_at: now,
        },
      ]);

    if (chatError) {
      console.error("Error creating default chat session:", chatError);
      throw new Error(
        `Failed to create default chat session: ${chatError.message}`
      );
    }

    console.log(`Successfully initialized all tables for user ${userId}`);
  } catch (error) {
    console.error("Fatal error in initializeUserTables:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        mfaToken: { label: "MFA Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // If name is provided, this is a signup request
        if (credentials.name) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
              data: {
                full_name: credentials.name,
              },
            },
          });

          if (signUpError) {
            console.log(signUpError);
            throw new Error(signUpError.message);
          }

          throw new Error("Check your email for a verification link");
        }

        // Otherwise, this is a signin request
        const {
          data: { user },
          error,
        } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !user) {
          console.log(error);
          throw new Error(error?.message || "Invalid credentials");
        }

        // Check if MFA is enabled for this user
        const { data: mfaData } = await supabase
          .from("user_mfa")
          .select("is_enabled")
          .eq("user_id", user.id)
          .single();

        if (mfaData?.is_enabled) {
          console.log("MFA is enabled for user, checking token...");
          // If MFA token is not provided but MFA is enabled
          if (!credentials.mfaToken) {
            console.log("No MFA token provided");
            throw new Error("MFA_REQUIRED");
          }

          console.log("Verifying MFA token...");
          // Verify MFA token
          const { verifyMFA } = await import("@/lib/auth/mfa");
          const isValidToken = await verifyMFA(user.id, credentials.mfaToken);

          console.log("MFA verification result:", isValidToken);
          if (!isValidToken) {
            console.log("Invalid MFA token provided");
            throw new Error("Invalid MFA token");
          }
          console.log("MFA verification successful");
        }

        // Check if this is the first time login (after email verification)
        const { data: profile } = await supabase
          .from("user_profiles")
          .select()
          .eq("user_id", user.id)
          .single();

        if (!profile) {
          // Initialize user tables on first login
          console.log(
            "Profile not found, starting initialization for user:",
            user.id
          );
          try {
            await initializeUserTables(user.id);
            console.log("Initialization completed successfully");
          } catch (error) {
            console.error("Initialization failed:", error);
            throw error;
          }
        }

        console.log("User authenticated successfully:", user);

        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("Starting signIn callback with:", {
        user: { email: user.email, name: user.name },
        accountProvider: account?.provider,
        hasProfile: !!profile
      });

      // For credentials authentication, just return true as the authorize function already handles verification
      if (!account || !profile) {
        console.log("No account or profile, assuming credentials auth");
        return true;
      }

      try {
        // Check if a user exists with this email
        console.log("Checking for existing user with email:", user.email);
        const { data: { users }, error: userError } = await supabase.auth.admin
          .listUsers();

        const existingUser = users.find(u => u.email === user.email);

        if (userError) {
          console.error("Error checking existing user:", userError);
          console.error("Error details:", JSON.stringify(userError, null, 2));
          return false;
        }

        let userId = existingUser?.id;
        console.log("Existing user check result:", { userId, exists: !!userId });

        // If no user exists in auth.users, create one
        if (!userId) {
          console.log("Creating new user in auth.users");
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: user.email!,
            email_confirm: true,
            user_metadata: {
              full_name: user.name,
              avatar_url: user.image,
              provider: account.provider
            },
          });

          if (createError) {
            console.error("Error creating user:", createError);
            return false;
          }

          userId = newUser.user.id;
          console.log("Created new user with ID:", userId);

          // Initialize other tables for the new user
          await initializeUserTables(userId);
        } else {
          // Check if user has profile initialized
          console.log("Checking if user has profile initialized");
          const { data: profile } = await supabase
            .from("user_profiles")
            .select()
            .eq("user_id", userId)
            .single();


          if (!profile) {
            console.log("Profile not found, initializing tables for existing auth user");
            await initializeUserTables(userId);
          }

          // Check if user has connected providers
          const { data: oauthData } = await supabase
            .from("oauth_accounts")
            .select("provider")
            .eq("user_id", userId);

          const connectedProviders = oauthData?.map(account => account.provider) || [];
          console.log("Connected providers:", connectedProviders);

          // If no connected providers, add the current provider
          if (!connectedProviders.includes(account.provider)) {
            console.log("Adding new provider connection:", {
              provider: account.provider,
              userId,
              providerAccountId: account.providerAccountId
            });
            
            const { data: newAccount, error: insertError } = await supabase.from("oauth_accounts").insert({
              user_id: userId,
              provider: account.provider.toLowerCase(),
              created_at: new Date().toISOString(),
              provider_account_id: account.providerAccountId,
            });

            if (insertError) {
              console.error("Error adding connected provider:", insertError);
            }

            console.log("Added connected provider result:", { newAccount, error: insertError });
          }
        }

        // Check MFA status
        const { data: mfaData } = await supabase
          .from("user_mfa")
          .select("is_enabled")
          .eq("user_id", userId)
          .single();

        if (mfaData?.is_enabled) {
          return `/login?email=${encodeURIComponent(user.email!)}&requireMfa=true&provider=${account.provider}`;
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        // For OAuth sign in, we need to get the Supabase user ID
        if (account && account.type === "oauth") {
          // Find the Supabase user with matching email
          const { data: { users } } = await supabase.auth.admin.listUsers();
          const supabaseUser = users.find(u => u.email === user.email);
          if (supabaseUser) {
            token.id = supabaseUser.id;
          }
        } else {
          // For credentials sign in, we already have the correct ID
          token.id = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};

export default authOptions;
