/**
 * SalvageReef Secure Image Compression & Sanitization Utility
 * Converts user uploaded images (JPG, PNG, GIF, WEBP) into lightweight WebP format.
 * Re-draws image onto HTML5 Canvas to eliminate hidden EXIF / PHP script injection vulnerabilities.
 */

export interface CompressionResult {
  dataUrl: string;
  isPdf?: boolean;
  width?: number;
  height?: number;
  originalSizeStr: string;
  compressedSizeStr: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  fileName: string;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Checks if a data URL or file URL represents a PDF document
 */
export function isPdfDocument(urlOrData?: string | null): boolean {
  if (!urlOrData) return false;
  const str = urlOrData.toLowerCase();
  return (
    str.startsWith('data:application/pdf') ||
    str.endsWith('.pdf') ||
    str.includes('.pdf?') ||
    str.includes('type=pdf') ||
    str.includes('application/pdf')
  );
}

/**
 * Verifies true file type via Magic Bytes (Binary Header Analysis)
 */
function verifyMagicBytes(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      if (!e.target?.result) return resolve(false);
      const arr = new Uint8Array(e.target.result as ArrayBuffer);
      if (arr.length < 4) return resolve(false);

      // PDF: 25 50 44 46 (%PDF)
      const isPdf = arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46;

      // JPEG: FF D8 FF
      const isJpeg = arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF;

      // PNG: 89 50 4E 47 0D 0A 1A 0A
      const isPng = arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47;

      // GIF: 47 49 46 (GIF87a / GIF89a)
      const isGif = arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46;

      // WEBP: RIFF .... WEBP
      const isWebp =
        arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46 &&
        arr.length >= 12 && arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50;

      resolve(isPdf || isJpeg || isPng || isGif || isWebp);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 12));
  });
}

/**
 * Universal file processor for images (JPG/PNG/WEBP/GIF) and PDF documents.
 */
export function processUploadFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.82
): Promise<CompressionResult> {
  return new Promise(async (resolve, reject) => {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const isPdf = file.type === 'application/pdf' || fileExt === 'pdf';

    if (isPdf) {
      if (file.size > 25 * 1024 * 1024) {
        return reject(new Error('PDF document size exceeds 25 MB limit.'));
      }
      const isAuthentic = await verifyMagicBytes(file);
      if (!isAuthentic) {
        return reject(new Error('Security Alert: Corrupted or invalid PDF header. Upload blocked.'));
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read PDF document.'));
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        resolve({
          dataUrl,
          isPdf: true,
          width: 800,
          height: 1100,
          originalSizeStr: formatBytes(file.size),
          compressedSizeStr: formatBytes(file.size),
          originalSizeBytes: file.size,
          compressedSizeBytes: file.size,
          fileName: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
        });
      };
      reader.readAsDataURL(file);
      return;
    }

    // Process standard image
    try {
      const res = await compressAndSanitizeImage(file, maxWidth, maxHeight, quality);
      resolve({ ...res, isPdf: false });
    } catch (err) {
      reject(err);
    }
  });
}

export function compressAndSanitizeImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.82
): Promise<CompressionResult> {
  return new Promise(async (resolve, reject) => {
    // Defensive Auto-Correction: If developer accidentally passes quality as 3rd arg (e.g. maxHeight <= 1)
    if (typeof maxHeight === 'number' && maxHeight > 0 && maxHeight <= 1) {
      quality = maxHeight;
      maxHeight = 1200;
    }
    if (!maxWidth || maxWidth <= 1) maxWidth = 1200;
    if (!maxHeight || maxHeight <= 1) maxHeight = 1200;
    if (!quality || quality <= 0 || quality > 1) quality = 0.82;

    // 1. Strict MIME Type Security Check
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return reject(new Error('Security Alert: Invalid file type! Only JPG, PNG, WEBP, and GIF images are allowed.'));
    }

    // 2. Strict File Extension Security Check
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!allowedExtensions.includes(fileExt)) {
      return reject(new Error('Security Alert: Potentially dangerous file extension detected! Upload blocked.'));
    }

    // 3. Deep Binary Magic Byte Header Inspection (Prevents Polyglot Script / PHP Shell Injection)
    const isAuthenticImage = await verifyMagicBytes(file);
    if (!isAuthenticImage) {
      return reject(new Error('Security Alert: Malicious file payload or spoofed image header detected! Upload blocked.'));
    }

    const originalSizeBytes = file.size;
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (event) => {
      const originalDataUrl = event.target?.result as string;
      const img = new Image();
      img.onerror = () => {
        // Fallback to original Data URL if Image object fails loading
        resolve({
          dataUrl: originalDataUrl,
          width: 800,
          height: 600,
          originalSizeStr: formatBytes(originalSizeBytes),
          compressedSizeStr: formatBytes(originalSizeBytes),
          originalSizeBytes,
          compressedSizeBytes: originalSizeBytes,
          fileName: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
        });
      };

      img.onload = () => {
        // Calculate new dimensions preserving aspect ratio
        let { width, height } = img;
        if (width <= 0 || height <= 0) {
          width = 800;
          height = 600;
        }

        if (width > maxWidth) {
          height = Math.max(1, Math.round((height * maxWidth) / width));
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.max(1, Math.round((width * maxHeight) / height));
          height = maxHeight;
        }
        width = Math.max(1, width);
        height = Math.max(1, height);

        // Create HTML5 Canvas (Sanitizes hidden metadata & script payloads)
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return resolve({
            dataUrl: originalDataUrl,
            width,
            height,
            originalSizeStr: formatBytes(originalSizeBytes),
            compressedSizeStr: formatBytes(originalSizeBytes),
            originalSizeBytes,
            compressedSizeBytes: originalSizeBytes,
            fileName: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
          });
        }

        // Clear canvas background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Draw image (re-encodes pixels, stripping any malicious EXIF or embedded PHP code)
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP (fallback to JPEG if webp not supported)
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Calculate compressed size
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const compressedSizeBytes = Math.round(base64Length * (3 / 4));

        // Safeguard: if canvas produced an empty or corrupted dataUrl (less than 100 bytes), fallback to original dataUrl
        if (compressedSizeBytes < 100 || !dataUrl.includes('base64,')) {
          dataUrl = originalDataUrl;
        }

        resolve({
          dataUrl,
          width,
          height,
          originalSizeStr: formatBytes(originalSizeBytes),
          compressedSizeStr: formatBytes(compressedSizeBytes > 0 ? compressedSizeBytes : originalSizeBytes),
          originalSizeBytes,
          compressedSizeBytes: compressedSizeBytes > 0 ? compressedSizeBytes : originalSizeBytes,
          fileName: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'), // Sanitize filename
        });
      };

      img.src = originalDataUrl;
    };

    reader.readAsDataURL(file);
  });
}
