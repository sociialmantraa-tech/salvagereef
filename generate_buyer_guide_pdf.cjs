#!/usr/bin/env node
/**
 * ============================================================================
 * SalvageReef — Buyer & Bidder Registration Manual (PDF Generator)
 * ============================================================================
 * Simple, professional, step-by-step buyer onboarding guide.
 * Written in easy-to-understand plain language for buyers/bidders.
 */

const { jsPDF } = require('./frontend/node_modules/jspdf');
const fs = require('fs');
const path = require('path');

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
const margin = 14;
const contentWidth = pageWidth - margin * 2; // 182mm

// --- Color Palette ---
const NAVY = [11, 25, 44];       // #0B192C
const GOLD = [212, 139, 28];     // #D48B1C
const LIGHT_BG = [248, 250, 252];// #F8FAFC
const WHITE = [255, 255, 255];
const DARK_TEXT = [30, 41, 59];  // #1E293B
const MUTED_TEXT = [100, 116, 139];// #64748B
const EMERALD = [16, 185, 129];  // #10B981
const BORDER = [226, 232, 240];  // #E2E8F0
const SOFT_BLUE = [238, 242, 255];
const SOFT_AMBER = [254, 243, 199];

function drawHeader(pageNumber, totalPages = 3) {
  // Top Banner
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Gold accent line under header
  doc.setFillColor(...GOLD);
  doc.rect(0, 24, pageWidth, 1.5, 'F');

  // Logo / Brand
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SALVAGEREEF', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text('B2B INDUSTRIAL SALVAGE & FORWARD AUCTIONS', margin, 17.5);

  // Right Header Info
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Portal: salvagereef.com', pageWidth - margin, 11, { align: 'right' });
  doc.setTextColor(203, 213, 225);
  doc.text('Buyer Helpline: +91 7304481166', pageWidth - margin, 17, { align: 'right' });

  // Footer
  doc.setFillColor(...NAVY);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('SalvageReef Operations Desk  |  Official Buyer Onboarding Manual', margin, pageHeight - 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GOLD);
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
}

// ============================================================================
// PAGE 1: INTRODUCTION & 3 REQUIRED KYC DOCUMENTS
// ============================================================================
drawHeader(1);

let y = 33;

// Hero Badge
doc.setFillColor(...SOFT_AMBER);
doc.roundedRect(margin, y, 70, 7, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...GOLD);
doc.text('BUYER & BIDDER ONBOARDING GUIDE', margin + 3, y + 5);

y += 12;

// Main Title
doc.setFont('helvetica', 'bold');
doc.setFontSize(18);
doc.setTextColor(...NAVY);
doc.text('How to Register as a Buyer on SalvageReef', margin, y);

y += 6;
doc.setFont('helvetica', 'normal');
doc.setFontSize(9.5);
doc.setTextColor(...MUTED_TEXT);
doc.text('A simple, step-by-step guide for scrap buyers, plant liquidators & asset bidders.', margin, y);

y += 9;

// Highlight Box: What is SalvageReef for Buyers?
doc.setFillColor(...LIGHT_BG);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, contentWidth, 32, 3, 3, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(...NAVY);
doc.text('What You Can Do as a Registered Buyer:', margin + 6, y + 7);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(...DARK_TEXT);
const perks = [
  '• Participate in Live Online Bidding for scrap metals, industrial plant machinery, vehicles, and factory surplus.',
  '• Access 100% verified asset lots with complete technical inspection PDFs, photos, and exact site locations.',
  '• Real-time competitive bidding with transparent H1 (Highest Bidder) award confirmation directly from top enterprises.',
  '• Zero hidden charges — Direct purchase awards, prompt EMD refunds, and dedicated desk support.',
];
let perkY = y + 13;
perks.forEach((p) => {
  doc.text(p, margin + 6, perkY);
  perkY += 4.5;
});

y += 39;

// Section Header: Required Documents
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(...NAVY);
doc.text('Keep These 3 Documents Ready Before Starting', margin, y);

y += 4;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(...MUTED_TEXT);
doc.text('To ensure genuine commercial bidding, every buyer requires a 1-time business KYC verification:', margin, y);

y += 7;

// 3 Document Cards
const docCards = [
  {
    num: '1',
    title: 'PAN Card Proof',
    sub: 'Business or Proprietor PAN',
    desc: 'Clear photo or PDF of your 10-character PAN card (e.g. ABCDE1234F). Used for identity and TDS compliance.',
    fileType: 'JPG, PNG, or PDF (Max 5MB)',
  },
  {
    num: '2',
    title: 'GST Certificate',
    sub: 'Form GST REG-06',
    desc: 'Government 15-digit GST Registration Certificate. Required to generate auction sale tax invoices.',
    fileType: 'JPG, PNG, or PDF (Max 5MB)',
  },
  {
    num: '3',
    title: 'Bank Account Proof',
    sub: 'Cancelled Cheque / Passbook',
    desc: 'A cancelled cheque or bank statement showing Account Number & IFSC Code. Used for fast security & EMD refund.',
    fileType: 'JPG, PNG, or PDF (Max 5MB)',
  },
];

const cardW = (contentWidth - 8) / 3;
docCards.forEach((card, idx) => {
  const cardX = margin + idx * (cardW + 4);
  const cardH = 58;

  // Background
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(cardX, y, cardW, cardH, 3, 3, 'FD');

  // Top accent badge
  doc.setFillColor(...NAVY);
  doc.circle(cardX + 8, y + 8, 4, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(card.num, cardX + 8, y + 9.5, { align: 'center' });

  // Title
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(card.title, cardX + 15, y + 8);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text(card.sub, cardX + 6, y + 16);

  // Description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK_TEXT);
  const splitDesc = doc.splitTextToSize(card.desc, cardW - 12);
  doc.text(splitDesc, cardX + 6, y + 23);

  // Format Footer
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(cardX + 4, y + cardH - 12, cardW - 8, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...MUTED_TEXT);
  doc.text(card.fileType, cardX + cardW / 2, y + cardH - 7, { align: 'center' });
});

y += 66;

// Pro-Tips Box
doc.setFillColor(236, 253, 245); // Light emerald
doc.setDrawColor(167, 243, 208);
doc.roundedRect(margin, y, contentWidth, 38, 3, 3, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(6, 95, 70); // Dark emerald
doc.text('3 Quick Tips for 10-Minute Account Approval:', margin + 6, y + 7);

const tips = [
  '1. Clear Photos: Ensure your phone camera photo is sharp and text is easily readable without blurry shadows.',
  '2. Name Matching: Make sure the Firm / Proprietor Name matches what is printed on your GST certificate.',
  '3. Correct Mobile & Email: You will receive real-time bidding notifications, auction reminders & award alerts there.',
];
let tipY = y + 14;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(4, 120, 87);
tips.forEach((t) => {
  doc.text(t, margin + 6, tipY);
  tipY += 6.5;
});

// ============================================================================
// PAGE 2: STEP-BY-STEP REGISTRATION WALKTHROUGH
// ============================================================================
doc.addPage();
drawHeader(2);

y = 33;

doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.setTextColor(...NAVY);
doc.text('Step-by-Step Registration Walkthrough', margin, y);

y += 5.5;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(...MUTED_TEXT);
doc.text('Visit https://salvagereef.com/register on any mobile phone or computer.', margin, y);

y += 9;

// Stage 1 Block
doc.setFillColor(...WHITE);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, contentWidth, 58, 3, 3, 'FD');

doc.setFillColor(...GOLD);
doc.roundedRect(margin, y, contentWidth, 7.5, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(...WHITE);
doc.text('STAGE 1 : BASIC COMPANY & CONTACT DETAILS', margin + 6, y + 5);

let s1Y = y + 13;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(...DARK_TEXT);

const s1Fields = [
  ['Country', 'Select India (+91) or your international country code.'],
  ['Firm / Vendor Name', 'Enter your full registered business name (e.g. Shree Shyam Traders).'],
  ['Entity Type', 'Choose Proprietorship, Partnership, Pvt Ltd, LLP, or Public Limited.'],
  ['PAN Number', 'Enter your 10-character PAN (5 letters, 4 numbers, 1 letter).'],
  ['GSTIN Number', 'Enter your 15-character GST number (e.g. 27ABCDE1234F1Z5).'],
  ['Business Address', 'Your registered address, State, City, and 6-digit Pincode.'],
  ['Contact Person (SPOC)', 'Name of primary owner / manager dealing with auctions.'],
  ['Mobile & Email ID', 'Active contact details for OTPs and auction award notices.'],
  ['Create Password', 'Choose a secure password (minimum 6 characters).'],
];

s1Fields.forEach(([label, desc], i) => {
  const colX = i < 5 ? margin + 6 : margin + contentWidth / 2 + 2;
  const rowY = s1Y + (i % 5) * 8.5;
  doc.setFont('helvetica', 'bold');
  doc.text(`• ${label}:`, colX, rowY);
  doc.setFont('helvetica', 'normal');
  const labelWidth = doc.getTextWidth(`• ${label}: `);
  const maxW = (contentWidth / 2) - labelWidth - 8;
  const wrapped = doc.splitTextToSize(desc, maxW);
  doc.text(wrapped[0], colX + labelWidth, rowY);
});

y += 64;

// Stage 2 Block
doc.setFillColor(...WHITE);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, contentWidth, 54, 3, 3, 'FD');

doc.setFillColor(...NAVY);
doc.roundedRect(margin, y, contentWidth, 7.5, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(...WHITE);
doc.text('STAGE 2 : BANK DETAILS & KYC DOCUMENT UPLOADS', margin + 6, y + 5);

let s2Y = y + 13;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(...DARK_TEXT);

const s2Steps = [
  ['Bank Name', 'Enter your commercial bank name (e.g. HDFC Bank, SBI, ICICI, Kotak).'],
  ['Account Number', 'Enter your 9 to 18 digit business or current account number.'],
  ['IFSC Code', 'Enter your 11-character bank branch IFSC code (e.g. HDFC0001234).'],
  ['Upload PAN Card', 'Click "Browse / Upload" and select your PAN card photo or PDF.'],
  ['Upload GST Certificate', 'Click "Browse / Upload" and select your GST REG-06 document.'],
  ['Upload Cancelled Cheque', 'Click "Browse / Upload" and select your passbook/cheque photo.'],
];

s2Steps.forEach(([label, desc], i) => {
  const colX = i < 3 ? margin + 6 : margin + contentWidth / 2 + 2;
  const rowY = s2Y + (i % 3) * 12;
  doc.setFont('helvetica', 'bold');
  doc.text(`✓ ${label}:`, colX, rowY);
  doc.setFont('helvetica', 'normal');
  const subWrap = doc.splitTextToSize(desc, (contentWidth / 2) - 10);
  doc.text(subWrap, colX + 4, rowY + 4);
});

y += 60;

// Stage 3 Block
doc.setFillColor(...WHITE);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, contentWidth, 48, 3, 3, 'FD');

doc.setFillColor(...EMERALD);
doc.roundedRect(margin, y, contentWidth, 7.5, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(...WHITE);
doc.text('STAGE 3 : FINAL REVIEW & COMPLETE REGISTRATION', margin + 6, y + 5);

let s3Y = y + 14;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(...DARK_TEXT);

const s3Info = [
  '1. Review Summary Card: Check your company name, GST, contact details, and uploaded document badges.',
  '2. Click "Accept Terms & Conditions": Check the box declaring authentic business information.',
  '3. Click "Complete Registration": The gold button will submit your application securely to SalvageReef.',
  '4. Instant Confirmation: You will see a green shield screen confirming submission for Admin Verification.',
];

s3Info.forEach((step) => {
  doc.text(step, margin + 6, s3Y);
  s3Y += 6.5;
});

// Green Callout
doc.setFillColor(240, 253, 244);
doc.roundedRect(margin + 6, s3Y + 1, contentWidth - 12, 8, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(21, 128, 61);
doc.text('✓ Auto-Saved: Your documents & inputs are safely saved — no data is lost during submission.', margin + 10, s3Y + 6);

// ============================================================================
// PAGE 3: AFTER REGISTRATION — APPROVAL, LOGIN & HOW TO BID
// ============================================================================
doc.addPage();
drawHeader(3);

y = 33;

doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.setTextColor(...NAVY);
doc.text('After Registration: Approval, Login & How to Bid', margin, y);

y += 5.5;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(...MUTED_TEXT);
doc.text('Everything you need to know about buying industrial assets on SalvageReef.', margin, y);

y += 9;

// Timeline / Process: 4 Steps
const timeline = [
  {
    step: 'STEP 1',
    title: 'Admin Verification (Within 2 to 4 Hours)',
    desc: 'The SalvageReef compliance team reviews your GST and uploaded documents. Once approved, your account is activated and you will receive your unique Login ID (e.g. SR-102934).',
    badgeBg: [224, 231, 255],
    badgeColor: [67, 56, 202],
  },
  {
    step: 'STEP 2',
    title: 'Sign In to Your Buyer Account',
    desc: 'Visit https://salvagereef.com/login. Enter your registered Email ID or Login ID and your password to access your personalized Buyer Control Dashboard.',
    badgeBg: [254, 243, 199],
    badgeColor: [180, 83, 9],
  },
  {
    step: 'STEP 3',
    title: 'Browse Live Tenders & Pay EMD',
    desc: 'Go to https://salvagereef.com/auctions. Review lot catalogs, photos, and inspection reports. To unlock live bidding on a lot, pay the refundable lot EMD (Earnest Money Deposit) via bank transfer.',
    badgeBg: [236, 253, 245],
    badgeColor: [4, 120, 87],
  },
  {
    step: 'STEP 4',
    title: 'Participate in Live Bidding & Win',
    desc: 'When the auction goes live, enter your bids in real time. If your bid is the highest at auction close, you will be confirmed as the H1 Winner! Complete balance payment and arrange material lifting.',
    badgeBg: [254, 226, 226],
    badgeColor: [185, 28, 28],
  },
];

timeline.forEach((item) => {
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(margin, y, contentWidth, 24, 2.5, 2.5, 'FD');

  // Step Badge
  doc.setFillColor(...item.badgeBg);
  doc.roundedRect(margin + 4, y + 4, 16, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...item.badgeColor);
  doc.text(item.step, margin + 12, y + 8, { align: 'center' });

  // Title
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(item.title, margin + 24, y + 8.5);

  // Description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(...DARK_TEXT);
  const wrapDesc = doc.splitTextToSize(item.desc, contentWidth - 28);
  doc.text(wrapDesc, margin + 24, y + 14);

  y += 27;
});

y += 3;

// Important Rules Box
doc.setFillColor(...LIGHT_BG);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, contentWidth, 38, 3, 3, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(...NAVY);
doc.text('Important Bidding Rules for Buyers:', margin + 6, y + 6);

const rules = [
  '• EMD Refund Guarantee: If you do not win the auction, your full Earnest Money Deposit is promptly refunded to your bank account within 2 business days.',
  '• Physical Site Inspection: Buyers have the right to physically inspect scrap lots at the factory location prior to auction close.',
  '• Binding Bids: All bids placed on the live platform are legally binding. Ensure you review the lot specification and tax terms carefully before bidding.',
];
let rY = y + 12;
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(...DARK_TEXT);
rules.forEach((r) => {
  const rWrap = doc.splitTextToSize(r, contentWidth - 12);
  doc.text(rWrap, margin + 6, rY);
  rY += 7.5;
});

y += 44;

// Dedicated Support Contact Card
doc.setFillColor(...NAVY);
doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F');

doc.setTextColor(...WHITE);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.text('Need Assistance with Buyer Registration?', margin + 8, y + 8);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(203, 213, 225);
doc.text('Our dedicated Desk Support executive is available Monday to Saturday, 9:30 AM to 6:30 PM.', margin + 8, y + 14);

// Contact Grid
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...GOLD);
doc.text('Phone / WhatsApp: +91 7304481166', margin + 8, y + 22);
doc.text('Email: salvagereef@gmail.com', margin + 95, y + 22);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(...WHITE);
doc.text('Website: https://salvagereef.com/register', margin + 8, y + 26);
doc.text('Head Office: Mumbai, Maharashtra', margin + 95, y + 26);

// ============================================================================
// SAVE FILE
// ============================================================================
const outDir = path.resolve(__dirname);
const rootPdfPath = path.join(outDir, 'SalvageReef_Buyer_Registration_Guide.pdf');
const publicPdfPath = path.join(outDir, 'frontend', 'public', 'SalvageReef_Buyer_Registration_Guide.pdf');
const deployPdfPath = path.join(outDir, 'deploy_hosting', 'public_html', 'SalvageReef_Buyer_Registration_Guide.pdf');

const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

fs.writeFileSync(rootPdfPath, pdfBuffer);
console.log(`[✓] Created root PDF: ${rootPdfPath} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);

if (fs.existsSync(path.dirname(publicPdfPath))) {
  fs.writeFileSync(publicPdfPath, pdfBuffer);
  console.log(`[✓] Copied to frontend/public: ${publicPdfPath}`);
}

if (fs.existsSync(path.dirname(deployPdfPath))) {
  fs.writeFileSync(deployPdfPath, pdfBuffer);
  console.log(`[✓] Copied to deploy_hosting/public_html: ${deployPdfPath}`);
}
