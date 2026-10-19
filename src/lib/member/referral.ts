/** Partner referral codes (AZ-123456 or a personal code) from ?ref= links, remembered for 30 days on this device. */
const KEY = 'azr_ref';
const DAYS = 30;

export function rememberRef(code: string | null | undefined) {
  if (!code || typeof window === 'undefined') return;
  const clean = code.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9-]{2,18}[A-Z0-9]$/.test(clean)) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ code: clean, until: Date.now() + DAYS * 86400000 }));
  } catch {
    // storage unavailable
  }
}

export function getRef(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return undefined;
    const { code, until } = JSON.parse(raw);
    if (!code || Date.now() > until) {
      localStorage.removeItem(KEY);
      return undefined;
    }
    return code;
  } catch {
    return undefined;
  }
}
