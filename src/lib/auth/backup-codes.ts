import { randomBytes } from "crypto";

export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 6 bytes of random data and convert to a 12-character hex string
    const code = randomBytes(6).toString("hex");
    // Format as xxxx-xxxx-xxxx
    codes.push(code.match(/.{4}/g)!.join("-"));
  }
  return codes;
} 