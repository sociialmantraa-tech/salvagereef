/**
 * Formats user/bidder names according to SalvageReef privacy rules:
 * - Admin users see the FULL UNMASKED name (e.g. "Rajesh Kumar")
 * - Regular logged-in users see ONLY starting first 2 letters + *** + ending 2 letters (e.g. "Ne***ma", "Ra***sh", "Vi***er")
 */
export function formatBidderName(name: string | null | undefined, isAdmin: boolean = false): string {
  if (!name) return 'Bi***er';
  if (isAdmin) return name;

  const clean = name.trim();
  if (clean.includes('***')) {
    return clean;
  }
  if (clean.length <= 4) {
    return `${clean.slice(0, 1)}***${clean.slice(-1)}`;
  }

  const firstTwo = clean.slice(0, 2);
  const lastTwo = clean.slice(-2);
  return `${firstTwo}***${lastTwo}`;
}

