/**
 * Universal Image & Document URL Resolver for SalvageReef
 * Seamlessly resolves image paths across local dev (Vite / localhost:5175),
 * PHP backend (127.0.0.1:8000), and production cPanel hosting (salvagereef.com).
 */

export function resolveImageUrl(urlOrPath?: string | null, fallback = ''): string {
  if (!urlOrPath) return fallback;
  const str = String(urlOrPath).trim();
  if (!str) return fallback;

  // 1. Data URLs & Blob URLs (e.g. data:image/jpeg;base64,...)
  if (str.startsWith('data:') || str.startsWith('blob:')) {
    return str;
  }

  // 2. Full HTTP/HTTPS URLs
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return str;
  }

  // 3. Relative uploads paths (e.g. "uploads/kyc/..." or "/uploads/kyc/...")
  if (str.startsWith('/uploads/') || str.startsWith('uploads/')) {
    const cleanPath = str.startsWith('/') ? str : `/${str}`;
    return cleanPath;
  }

  // 4. Any other relative path
  return str.startsWith('/') ? str : `/${str}`;
}

/**
 * Validates whether an image or document URL is reachable/usable.
 */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false;
  const str = String(url).trim();
  if (!str || str === 'null' || str === 'undefined' || str === '{}') return false;
  return true;
}
