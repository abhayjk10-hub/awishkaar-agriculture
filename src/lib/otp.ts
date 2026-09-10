export const OTP_TTL_MS = Number(process.env.OTP_TTL_MINUTES || 5) * 60 * 1000;

const otpStore = new Map<string, { code: string; expiresAt: number }>();

export function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOtp(phone: string, code: string, ttlMs = OTP_TTL_MS) {
  otpStore.set(phone, {
    code,
    expiresAt: Date.now() + ttlMs,
  });
}

export function verifyOtpCode(phone: string, enteredCode: string, now = Date.now(), code?: string) {
  const record = otpStore.get(phone);
  if (!record) return false;
  if (now > record.expiresAt) {
    otpStore.delete(phone);
    return false;
  }

  const expected = code ?? record.code;
  const valid = record.code === expected && enteredCode === expected;

  if (valid) otpStore.delete(phone);
  return valid;
}

export function getOtpRecord(phone: string) {
  return otpStore.get(phone) ?? null;
}
