import { createClient } from "@supabase/supabase-js";
import { authenticator } from "otplib";
import { generateBackupCodes } from "@/lib/auth/backup-codes";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function setupMFA(userId: string) {
  const secret = authenticator.generateSecret();
  const backupCodes = generateBackupCodes();
  
  // Store MFA secret and backup codes in Supabase
  await supabase
    .from("user_mfa")
    .upsert({
      user_id: userId,
      secret,
      backup_codes: backupCodes,
      is_enabled: false,
    });

  return {
    secret,
    backupCodes,
    otpauthUrl: authenticator.keyuri("user", "TalkToAPI", secret),
  };
}

export async function verifyMFA(userId: string, token: string) {
  const { data: mfaData } = await supabase
    .from("user_mfa")
    .select("secret, backup_codes")
    .eq("user_id", userId)
    .single();

  if (!mfaData) return false;

  // Check if the token matches either the TOTP or a backup code
  const isValidTOTP = authenticator.verify({
    token,
    secret: mfaData.secret,
  });

  if (isValidTOTP) return true;

  // Check backup codes
  const backupCodeIndex = mfaData.backup_codes.indexOf(token);
  if (backupCodeIndex !== -1) {
    // Remove used backup code
    const updatedBackupCodes = [...mfaData.backup_codes];
    updatedBackupCodes.splice(backupCodeIndex, 1);
    
    await supabase
      .from("user_mfa")
      .update({ backup_codes: updatedBackupCodes })
      .eq("user_id", userId);
    
    return true;
  }

  return false;
}

export async function enableMFA(userId: string, token: string) {
  const isValid = await verifyMFA(userId, token);
  if (!isValid) return false;

  await supabase
    .from("user_mfa")
    .update({ is_enabled: true })
    .eq("user_id", userId);

  return true;
} 