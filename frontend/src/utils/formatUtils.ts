/**
 * Formats user/bidder names according to SalvageReef privacy rules:
 * - Admin users see the FULL UNMASKED name (e.g. "Rajesh Kumar")
 * - Public/regular users see ONLY first 2 letters + *** + last 2 letters (e.g. "Ne***ma", "Vi***er")
 */
export function formatBidderName(name: string | null | undefined, isAdmin: boolean = false): string {
  if (!name) return 'An***ous';
  if (isAdmin) return name;

  const clean = name.trim();
  if (clean.length <= 4) {
    return `${clean.slice(0, 1)}***${clean.slice(-1)}`;
  }

  const firstTwo = clean.slice(0, 2);
  const lastTwo = clean.slice(-2);
  return `${firstTwo}***${lastTwo}`;
}
