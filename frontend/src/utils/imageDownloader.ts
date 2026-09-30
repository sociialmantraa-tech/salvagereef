/**
 * Downloads a single image from a URL with a custom filename.
 */
export async function downloadSingleImage(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.warn('Direct blob download failed, opening image in new window fallback:', error);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Downloads all auction images sequentially.
 */
export async function downloadAllAuctionImages(images: string[], lotCode: string): Promise<void> {
  if (!images || images.length === 0) return;

  for (let i = 0; i < images.length; i++) {
    const imgUrl = images[i];
    const safeLotCode = (lotCode || 'LOT').replace(/[^a-zA-Z0-9_-]/g, '_');
    const ext = imgUrl.split('.').pop()?.split('?')[0] || 'jpg';
    const filename = `${safeLotCode}_photo_${i + 1}.${ext}`;

    await downloadSingleImage(imgUrl, filename);
    // Slight pause to avoid browser download blocking
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}
