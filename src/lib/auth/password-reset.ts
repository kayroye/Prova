import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });
  
  return { error };
}

export async function resetPassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { error };
}

// Track failed login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkLoginAttempts(email: string): boolean {
  const attempts = loginAttempts.get(email);
  const now = Date.now();

  // Reset attempts after 15 minutes
  if (attempts && now - attempts.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(email);
    return true;
  }

  // Block after 5 failed attempts
  if (attempts && attempts.count >= 5) {
    return false;
  }

  return true;
}

export function recordFailedLoginAttempt(email: string) {
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
  loginAttempts.set(email, {
    count: attempts.count + 1,
    lastAttempt: Date.now(),
  });
}

export function resetLoginAttempts(email: string) {
  loginAttempts.delete(email);
} 