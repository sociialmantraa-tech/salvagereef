import { jsPDF } from 'jspdf';
import { Auction } from '../types';

/**
 * Converts an image URL to a base64 Data URL for embedding in jsPDF.
 */
async function getBase64ImageFromUrl(imageUrl: string): Promise<string | null> {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('data:image/')) return imageUrl;
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
 * Format currency without Unicode font glyph issues in jsPDF Helvetica
 */
function formatInrPdf(val: number | string | undefined | null): string {
  const num = Number(val || 0);
  return `Rs. ${num.toLocaleString('en-IN')}`;
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
  const contentWidth = pageWidth - margin * 2;
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
  doc.roundedRect(pageWidth - margin - 48, 7, 48, 14, 2, 2, 'F');
  doc.setTextColor(11, 25, 44);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`LOT REF: ${lotCode}`, pageWidth - margin - 45, 15.5);

  y = 35;

  // --- AUCTION TITLE & STATUS ---
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  const titleLines = doc.splitTextToSize(auction.title || `Auction Lot #${auction.id}`, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 5.5 + 2;

  // Status & Category Row
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  const statusStr = (auction.status || 'live').toUpperCase();
  const categoryName = typeof auction.category === 'object' ? auction.category?.name : auction.category || 'Industrial Scrap & Machinery';
  const typeStr = (auction.auction_type || 'Public').toUpperCase();
  doc.text(`Category: ${categoryName}  |  Status: ${statusStr}  |  Type: ${typeStr} AUCTION`, margin, y);
  y += 5;

  // Horizontal divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // --- SECTION 1: KEY COMMERCIALS & PRICING TABLE ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'S');

  const colWidth = contentWidth / 4;

  // Box 1: Starting Price
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('STARTING / RESERVE', margin + 4, y + 6);
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(formatInrPdf(auction.starting_price), margin + 4, y + 14);

  // Box 2: EMD Amount
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('EMD DEPOSIT', margin + colWidth + 4, y + 6);
  doc.setFontSize(10.5);
  doc.setTextColor(180, 83, 9); // Amber 700
  doc.text(formatInrPdf(auction.emd_amount), margin + colWidth + 4, y + 14);

  // Box 3: Min Bid Increment
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('MIN INCREMENT', margin + colWidth * 2 + 4, y + 6);
  doc.setFontSize(10.5);
  doc.setTextColor(16, 185, 129); // Emerald 500
  doc.text(`+ ${formatInrPdf(auction.bid_increment || 1000)}`, margin + colWidth * 2 + 4, y + 14);

  // Box 4: Current Highest Bid
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('CURRENT HIGHEST', margin + colWidth * 3 + 4, y + 6);
  doc.setFontSize(10.5);
  doc.setTextColor(11, 25, 44);
  const highestVal = auction.current_highest_bid || auction.starting_price || 0;
  doc.text(formatInrPdf(highestVal), margin + colWidth * 3 + 4, y + 14);

  // Sub-row: Quantity & Location inside the commercial box
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const locationStr = [auction.location_city, auction.location_state].filter(Boolean).join(', ') || 'Mumbai, Maharashtra';
  const qtyStr = `${auction.quantity || 1} ${auction.unit || 'MT'}`;
  doc.text(`Lot Quantity: ${qtyStr}   |   Inspection Location: ${locationStr}`, margin + 4, y + 25);
  doc.text(`Tender ID: #${auction.id}   |   Consignor Type: Verified Industrial Seller`, margin + 4, y + 30);

  y += 40;

  // --- SECTION 2: SPECIFICATIONS & MATERIAL DETAILS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(11, 25, 44);
  doc.text('LOT SPECIFICATIONS & MATERIAL DESCRIPTION', margin, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const descText = auction.description || 'Verified salvage / scrap lot available for commercial bidding and dispatch.';
  const splitDesc = doc.splitTextToSize(descText, contentWidth);
  doc.text(splitDesc, margin, y);
  y += splitDesc.length * 4 + 3;

  if (auction.condition) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Material Condition & Quality Grade:', margin, y);
    y += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const condLines = doc.splitTextToSize(auction.condition, contentWidth);
    doc.text(condLines, margin, y);
    y += condLines.length * 4 + 3;
  }

  // --- SECTION 3: TIMELINE & ANTI-SNIPING (DYNAMIC AUTO-WRAPPED BOX) ---
  const startStr = auction.start_time ? new Date(auction.start_time).toLocaleString('en-IN') : 'Active Now';
  const endStr = auction.end_time ? new Date(auction.end_time).toLocaleString('en-IN') : 'Scheduled Closing';
  
  const scheduleLine = `Auction Schedule: Starts: ${startStr}  |  Closes: ${endStr}`;
  const antiSnipeLine = `ANTI-SNIPING RULE: Bids placed in the final 2 minutes will automatically extend the closing time by +2:00 minutes to ensure fair competition.`;

  doc.setFontSize(7.5);
  const splitSchedule = doc.splitTextToSize(scheduleLine, contentWidth - 8);
  const splitAntiSnipe = doc.splitTextToSize(antiSnipeLine, contentWidth - 8);
  const boxHeight = (splitSchedule.length + splitAntiSnipe.length) * 4 + 7;

  doc.setFillColor(254, 243, 199); // Amber 100
  doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'S');

  let textY = y + 4.5;
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.setFont('helvetica', 'bold');
  doc.text(splitSchedule, margin + 4, textY);
  textY += splitSchedule.length * 4 + 1;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 83, 9);
  doc.text(splitAntiSnipe, margin + 4, textY);

  y += boxHeight + 5;

  // --- SECTION 4: MULTI-IMAGE VISUAL INSPECTION GALLERY ---
  let imagesList: string[] = [];
  if (Array.isArray(auction.images) && auction.images.length > 0) {
    imagesList = auction.images
      .map((img: any) => typeof img === 'string' ? img : img.image_path)
      .filter((src: string) => src && !src.endsWith('.pdf'));
  }
  if (imagesList.length === 0 && (auction as any).primary_image?.image_path) {
    const pPath = (auction as any).primary_image.image_path;
    if (!pPath.endsWith('.pdf')) imagesList = [pPath];
  }
  if (imagesList.length === 0 && (auction as any).image_url && !(auction as any).image_url.endsWith('.pdf')) {
    imagesList = [(auction as any).image_url];
  }

  if (imagesList.length > 0 && y < pageHeight - 65) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(11, 25, 44);
    doc.text(`OFFICIAL LOT IMAGES & VISUAL INSPECTION (${imagesList.length} Photos Available)`, margin, y);
    y += 4.5;

    const maxImgs = Math.min(imagesList.length, 4);
    const gap = 3.5;
    const imgWidth = (contentWidth - (maxImgs - 1) * gap) / maxImgs;
    const imgHeight = Math.min(imgWidth * 0.68, 26);

    for (let i = 0; i < maxImgs; i++) {
      const imgX = margin + i * (imgWidth + gap);
      try {
        const base64 = await getBase64ImageFromUrl(imagesList[i]);
        if (base64) {
          doc.addImage(base64, 'JPEG', imgX, y, imgWidth, imgHeight);
          doc.setDrawColor(203, 213, 225);
          doc.rect(imgX, y, imgWidth, imgHeight, 'S');
        } else {
          doc.setFillColor(241, 245, 249);
          doc.rect(imgX, y, imgWidth, imgHeight, 'F');
          doc.setFontSize(6.5);
          doc.setTextColor(148, 163, 184);
          doc.text(`Photo ${i + 1}`, imgX + imgWidth / 4, y + imgHeight / 2);
        }
      } catch {
        doc.setFillColor(241, 245, 249);
        doc.rect(imgX, y, imgWidth, imgHeight, 'F');
      }
    }
    y += imgHeight + 5;
  }

  // --- SECTION 5: YARD INSPECTION & BIDDING TERMS ---
  if (y < pageHeight - 40) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Yard Inspection & Essential Bidding Guidelines:', margin, y);
    y += 3.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    
    const terms = [
      '1. Material is offered strictly on "As Is Where Is" and "No Complaint" basis.',
      '2. Physical inspection is permitted at the specified site yard with prior authorization from the Operations Desk.',
      '3. Highest bidder (H1) must remit 100% invoice settlement within 48 to 72 hours of official confirmation.',
      '4. Earnest Money Deposit (EMD) is mandatory to bid and will be adjusted against final settlement or refunded upon lot completion.'
    ];

    for (const t of terms) {
      if (y > pageHeight - 20) break;
      const tLines = doc.splitTextToSize(t, contentWidth);
      doc.text(tLines, margin, y);
      y += tLines.length * 3.2;
    }
  }

  // --- FOOTER: Verification & Contact ---
  doc.setFillColor(248, 250, 252);
  doc.rect(0, pageHeight - 14, pageWidth, 14, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(0, pageHeight - 14, pageWidth, pageHeight - 14);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 25, 44);
  doc.text('SalvageReef Operations Desk', margin, pageHeight - 8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Helpdesk / WhatsApp: +91 7304481166   |   Website: www.salvagereef.com   |   Email: salvagereef@gmail.com', margin, pageHeight - 4.5);

  const timestamp = new Date().toLocaleDateString('en-IN');
  doc.text(`Generated: ${timestamp}`, pageWidth - margin - 32, pageHeight - 4.5);

  // Trigger Save
  const safeFilename = `SalvageReef_Auction_${lotCode}_Dossier.pdf`.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  doc.save(safeFilename);
}
