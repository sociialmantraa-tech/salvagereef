/**
 * Formats user/bidder names according to SalvageReef privacy rules:
 * - Admin users see the FULL UNMASKED name (e.g. "Rajesh Kumar")
 * - Regular users see only the first 2 letters and last 2 letters with "*****" in between (e.g. "Ra*****ar")
 */
export function formatBidderName(name: string | null | undefined, isAdmin: boolean = false): string {
  if (!name) return 'Verified Bidder';
  if (isAdmin) return name;

  const clean = name.trim();
  if (clean.length <= 4) {
    if (clean.length <= 2) {
      return `${clean[0] || '*'}*****${clean.slice(-1) || '*'}`;
    }
    return `${clean.slice(0, 1)}*****${clean.slice(-1)}`;
  }

  const firstTwo = clean.slice(0, 2);
  const lastTwo = clean.slice(-2);
  return `${firstTwo}*****${lastTwo}`;
}
