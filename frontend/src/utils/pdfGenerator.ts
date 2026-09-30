import { jsPDF } from 'jspdf';
import { Auction } from '../types';

/**
 * Converts an image URL to a base64 Data URL for embedding in jsPDF.
 */
async function getBase64ImageFromUrl(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, { mode: 'cors' });
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Could not fetch image for PDF embedding:', err);
    return null;
  }
}

/**
 * Generates and triggers download of a high-fidelity, official SalvageReef
 * Auction Lot Dossier & Specification Catalog PDF.
 */
export async function downloadAuctionPdf(auction: Auction): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  // --- HEADER: Top Brand Bar ---
  doc.setFillColor(11, 25, 44); // Navy #0B192C
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SALVAGEREEF', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(212, 139, 28); // Amber #D48B1C
  doc.text('B2B INDUSTRIAL SALVAGE & FORWARD AUCTIONS', margin, 17);

  // Lot Reference Code Badge
  const lotCode = auction.lot_code || `LOT-${auction.id}`;
  doc.setFillColor(212, 139, 28);
  doc.roundedRect(pageWidth - margin - 45, 7, 45, 14, 2, 2, 'F');
  doc.setTextColor(11, 25, 44);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`LOT REF: ${lotCode}`, pageWidth - margin - 42, 15);

  y = 36;

  // --- AUCTION TITLE & STATUS ---
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const titleLines = doc.splitTextToSize(auction.title || `Auction Lot #${auction.id}`, pageWidth - margin * 2);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6 + 2;

  // Status & Category Row
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  const statusStr = (auction.status || 'live').toUpperCase();
  const categoryName = typeof auction.category === 'object' ? auction.category?.name : auction.category || 'Industrial Scrap & Machinery';
  doc.text(`Category: ${categoryName}  |  Status: ${statusStr}  |  Auction Type: ${(auction.auction_type || 'Public').toUpperCase()}`, margin, y);
  y += 6;

  // Horizontal divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // --- SECTION 1: KEY COMMERCIALS & PRICING TABLE ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 32, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 32, 2, 2, 'S');

  const colWidth = (pageWidth - margin * 2) / 4;

  // Box 1: Starting Price
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('STARTING / RESERVE', margin + 4, y + 7);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`₹${Number(auction.starting_price || 0).toLocaleString('en-IN')}`, margin + 4, y + 15);

  // Box 2: EMD Amount
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('EMD DEPOSIT', margin + colWidth + 4, y + 7);
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9); // Amber 700
  doc.text(`₹${Number(auction.emd_amount || 0).toLocaleString('en-IN')}`, margin + colWidth + 4, y + 15);

  // Box 3: Min Bid Increment
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('MIN INCREMENT', margin + colWidth * 2 + 4, y + 7);
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129); // Emerald 500
  doc.text(`+ ₹${Number(auction.bid_increment || 1000).toLocaleString('en-IN')}`, margin + colWidth * 2 + 4, y + 15);

  // Box 4: Current Highest Bid
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CURRENT HIGHEST', margin + colWidth * 3 + 4, y + 7);
  doc.setFontSize(11);
  doc.setTextColor(11, 25, 44);
  const highestVal = auction.current_highest_bid || auction.starting_price || 0;
  doc.text(`₹${Number(highestVal).toLocaleString('en-IN')}`, margin + colWidth * 3 + 4, y + 15);

  // Sub-row: Quantity & Location inside the box
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const locationStr = [auction.location_city, auction.location_state].filter(Boolean).join(', ') || 'Mumbai, Maharashtra';
  doc.text(`Material Quantity: ${auction.quantity} ${auction.unit || 'MT'}  |  Inspection Location: ${locationStr}`, margin + 4, y + 26);

  y += 38;

  // --- SECTION 2: SPECIFICATIONS & MATERIAL DETAILS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(11, 25, 44);
  doc.text('LOT SPECIFICATIONS & MATERIAL DESCRIPTION', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const descText = auction.description || 'Grade A verified scrap lot ready for immediate auction and dispatch.';
  const splitDesc = doc.splitTextToSize(descText, pageWidth - margin * 2);
  doc.text(splitDesc, margin, y);
  y += splitDesc.length * 4.5 + 4;

  if (auction.condition) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Material Condition & Quality Grade:', margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const condLines = doc.splitTextToSize(auction.condition, pageWidth - margin * 2);
    doc.text(condLines, margin, y);
    y += condLines.length * 4.5 + 4;
  }

  // --- SECTION 3: TIMELINE & ANTI-SNIPING ---
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 2, 2, 'F');
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  const startStr = auction.start_time ? new Date(auction.start_time).toLocaleString('en-IN') : 'Active Now';
  const endStr = auction.end_time ? new Date(auction.end_time).toLocaleString('en-IN') : 'Scheduled Closing';
  doc.text(`Auction Schedule: Starts: ${startStr}  |  Closes: ${endStr}`, margin + 3, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('⚡ Anti-Sniping Rule: Bids placed in the final 2 minutes will automatically extend the closing time by +2:00 minutes.', margin + 3, y + 12);
  y += 22;

  // --- SECTION 4: IMAGES EMBEDDED ---
  const imagesList = auction.images && auction.images.length > 0
    ? auction.images.map((img: any) => typeof img === 'string' ? img : img.image_path)
    : auction.primary_image?.image_path
    ? [auction.primary_image.image_path]
    : [];

  if (imagesList.length > 0 && y < pageHeight - 65) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(11, 25, 44);
    doc.text('OFFICIAL LOT IMAGES & VISUAL INSPECTION', margin, y);
    y += 5;

    const imgWidth = 40;
    const imgHeight = 28;
    const maxImgs = Math.min(imagesList.length, 4);

    for (let i = 0; i < maxImgs; i++) {
      const imgX = margin + i * (imgWidth + 4);
      try {
        const base64 = await getBase64ImageFromUrl(imagesList[i]);
        if (base64) {
          doc.addImage(base64, 'JPEG', imgX, y, imgWidth, imgHeight);
          doc.setDrawColor(203, 213, 225);
          doc.rect(imgX, y, imgWidth, imgHeight, 'S');
        } else {
          doc.setFillColor(241, 245, 249);
          doc.rect(imgX, y, imgWidth, imgHeight, 'F');
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.text(`Photo ${i + 1}`, imgX + 12, y + 15);
        }
      } catch {
        doc.setFillColor(241, 245, 249);
        doc.rect(imgX, y, imgWidth, imgHeight, 'F');
      }
    }
    y += imgHeight + 6;
  }

  // --- SECTION 5: LEGAL & BIDDING TERMS SUMMARY ---
  if (y < pageHeight - 40) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Key Terms & Bidding Rules:', margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('1. Sold strictly on "As Is, Where Is" and "No Complaint" basis.', margin, y); y += 3.5;
    doc.text('2. Winning bidder (H1) must complete 100% material payment within 48-72 hours of approval.', margin, y); y += 3.5;
    doc.text('3. Physical yard inspection requires pre-registration and authorization by the Operations Desk.', margin, y); y += 3.5;
    doc.text('4. EMD is mandatory for access and will be adjusted against final settlement or refunded upon lot completion.', margin, y); y += 5;
  }

  // --- FOOTER: Verification & Contact ---
  doc.setFillColor(248, 250, 252);
  doc.rect(0, pageHeight - 16, pageWidth, 16, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(0, pageHeight - 16, pageWidth, pageHeight - 16);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 25, 44);
  doc.text('SalvageReef Operations Desk', margin, pageHeight - 9);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Phone/WhatsApp: +91 7304481166  |  Website: www.salvagereef.com  |  Support: desk@salvagereef.com', margin, pageHeight - 5);

  const timestamp = new Date().toLocaleDateString('en-IN');
  doc.text(`Generated: ${timestamp}`, pageWidth - margin - 35, pageHeight - 5);

  // Trigger Save
  const safeFilename = `SalvageReef_Auction_${lotCode}_Dossier.pdf`.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  doc.save(safeFilename);
}
