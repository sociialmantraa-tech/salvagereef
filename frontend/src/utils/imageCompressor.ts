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

export function compressAndSanitizeImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.82
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
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
