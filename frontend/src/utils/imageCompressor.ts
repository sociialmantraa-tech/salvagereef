/**
 * SalvageReef Secure Image Compression & Sanitization Utility
 * Converts user uploaded images (JPG, PNG, GIF, WEBP) into lightweight WebP format.
 * Re-draws image onto HTML5 Canvas to eliminate hidden EXIF / PHP script injection vulnerabilities.
 */

export interface CompressionResult {
  dataUrl: string;
  width: number;
  height: number;
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
 * Verifies true file type via Magic Bytes (Binary Header Analysis)
 */
function verifyMagicBytes(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      if (!e.target?.result) return resolve(false);
      const arr = new Uint8Array(e.target.result as ArrayBuffer);
      if (arr.length < 4) return resolve(false);

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

      resolve(isJpeg || isPng || isGif || isWebp);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 12));
  });
}

export function compressAndSanitizeImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.82
): Promise<CompressionResult> {
  return new Promise(async (resolve, reject) => {
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
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid or corrupted image content.'));
      img.onload = () => {
        // Calculate new dimensions preserving aspect ratio
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        // Create HTML5 Canvas (Sanitizes hidden metadata & script payloads)
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('Could not create canvas context.'));
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
        const head = 'data:image/webp;base64,';
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const compressedSizeBytes = Math.round(base64Length * (3 / 4));

        resolve({
          dataUrl,
          width,
          height,
          originalSizeStr: formatBytes(originalSizeBytes),
          compressedSizeStr: formatBytes(compressedSizeBytes),
          originalSizeBytes,
          compressedSizeBytes,
          fileName: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'), // Sanitize filename
        });
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
