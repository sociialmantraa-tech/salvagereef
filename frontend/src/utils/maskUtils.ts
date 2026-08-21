/**
 * Mask bidder full name to show only first 2 letters + *** + last 2 letters.
 * Example: 'Neelkanth Sharma' -> 'Ne***ma'
 * Example: 'Vikram Scrap Buyer' -> 'Vi***er'
 */
export function maskBidderName(name?: string): string {
  if (!name || name.trim() === '') return 'An***ous';
  const trimmed = name.trim();
  if (trimmed.length <= 4) {
    return trimmed.substring(0, 1) + '***' + trimmed.substring(trimmed.length - 1);
  }
  const firstTwo = trimmed.substring(0, 2);
  const lastTwo = trimmed.substring(trimmed.length - 2);
  return `${firstTwo}***${lastTwo}`;
}
