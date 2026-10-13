#!/usr/bin/env node
/**
 * ============================================================================
 * SalvageReef — High-Aesthetic Buyer Registration & Signup PDF Manual
 * ============================================================================
 * Recreates the exact website registration portal visual design:
 * - Authentic Brand Emblem & Typography
 * - 3-Stage Golden Stepper Header (Basic Details -> Bank & Uploads -> Terms & Review)
 * - Beautiful dropzone upload cards, summary preview cards, and action buttons
 * - Written in crystal-clear, friendly plain language for buyers/bidders
 */

const { jsPDF } = require('./frontend/node_modules/jspdf');
const fs = require('fs');
const path = require('path');

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

const pageWidth = doc.internal.pageSize.getWidth();   // 210mm
const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
const margin = 14;
const contentWidth = pageWidth - margin * 2;         // 182mm

// --- Color Palette matching salvagereef.com ---
const NAVY = [11, 25, 44];          // #0B192C (Brand Navy)
const GOLD = [212, 139, 28];        // #D48B1C (Brand Amber / Gold)
const GOLD_HOVER = [184, 117, 20];  // #B87514
const SLATE_BG = [248, 250, 252];   // #F8FAFC
const WHITE = [255, 255, 255];
const DARK_SLATE = [15, 23, 42];    // #0F172A
const BODY_TEXT = [51, 65, 85];     // #334155
const MUTED = [100, 116, 139];      // #64748B
const BORDER = [226, 232, 240];     // #E2E8F0
const EMERALD = [16, 185, 129];     // #10B981
const EMERALD_BG = [236, 253, 245]; // #ECFDF5
const AMBER_BG = [254, 243, 199];   // #FEF3C7
const AMBER_BORDER = [252, 211, 77];// #FCD34D

// Read Brand Logo Emblem (PNG)
let logoBase64 = null;
const logoPath = path.join(__dirname, 'frontend', 'public', 'logo.png');
if (fs.existsSync(logoPath)) {
  logoBase64 = 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64');
}

// ─── Reusable Top Header Bar ────────────────────────────────────────────────
function drawPageHeader(doc, pageNumber, totalPages = 3) {
  // Deep Navy Brand Bar
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 25, 'F');

  // Golden accent bottom border line
  doc.setFillColor(...GOLD);
  doc.rect(0, 25, pageWidth, 1.2, 'F');

  // Embed Logo Emblem if available
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', margin, 4.5, 12, 15);
    } catch {}
  }

  const titleX = logoBase64 ? margin + 14.5 : margin;

  // Brand Name
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.text('SalvageReef', titleX, 12);

  // Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...GOLD);
  doc.text('AUCTIONS & CLASSIFIEDS  •  B2B TENDER PORTAL', titleX, 17.5);

  // Right Header Info
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('BUYER ONBOARDING GUIDE', pageWidth - margin, 11.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Website: salvagereef.com  |  Helpline: +91 7304481166', pageWidth - margin, 17.5, { align: 'right' });

  // Bottom Footer
  doc.setFillColor(...NAVY);
  doc.rect(0, pageHeight - 11, pageWidth, 11, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(203, 213, 225);
  doc.text('SalvageReef Operations Desk  |  Official Buyer & Bidder Verification Manual', margin, pageHeight - 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GOLD);
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 4.5, { align: 'right' });
}

// ─── Signature 3-Stage Stepper Header (Website Component) ───────────────────
function drawWebsiteStepper(doc, startY, activeStep = 1) {
  const stepperH = 24;
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(margin, startY, contentWidth, stepperH, 3.5, 3.5, 'FD');

  const step1X = margin + 30;
  const step2X = margin + contentWidth / 2;
  const step3X = margin + contentWidth - 30;
  const lineY = startY + 9;

  // Background connecting line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.8);
  doc.line(step1X, lineY, step3X, lineY);

  // Active golden progress line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.2);
  if (activeStep === 2) {
    doc.line(step1X, lineY, step2X, lineY);
  } else if (activeStep >= 3) {
    doc.line(step1X, lineY, step3X, lineY);
  }

  // Draw 3 Step Badges
  const steps = [
    { num: '1', title: 'BASIC DETAILS', x: step1X, stepNum: 1 },
    { num: '2', title: 'BANK & UPLOADS', x: step2X, stepNum: 2 },
    { num: '3', title: 'TERMS & REVIEW', x: step3X, stepNum: 3 },
  ];

  steps.forEach((s) => {
    const isCompleted = s.stepNum < activeStep;
    const isCurrent = s.stepNum === activeStep;

    if (isCompleted || isCurrent) {
      doc.setFillColor(...GOLD);
      doc.circle(s.x, lineY, 4.8, 'F');
      doc.setTextColor(...WHITE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(isCompleted ? '✓' : s.num, s.x, lineY + 1.2, { align: 'center' });
    } else {
      doc.setFillColor(226, 232, 240);
      doc.circle(s.x, lineY, 4.8, 'F');
      doc.setTextColor(...MUTED);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(s.num, s.x, lineY + 1.2, { align: 'center' });
    }

    // Step Title Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    if (isCurrent) {
      doc.setTextColor(...GOLD);
    } else if (isCompleted) {
      doc.setTextColor(...DARK_SLATE);
    } else {
      doc.setTextColor(...MUTED);
    }
    doc.text(s.title, s.x, startY + 19, { align: 'center' });
  });

  return startY + stepperH;
}

// ============================================================================
// PAGE 1: HERO, WHAT BUYERS CAN DO & 3 REQUIRED KYC DOCUMENTS
// ============================================================================
drawPageHeader(doc, 1);

let y = 31;

// "SALVAGE BUYER ONBOARDING PORTAL" pill badge (identical to website)
doc.setFillColor(...AMBER_BG);
doc.setDrawColor(...AMBER_BORDER);
doc.roundedRect(pageWidth / 2 - 40, y, 80, 6.5, 3.25, 3.25, 'FD');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...GOLD);
doc.text('SALVAGE BUYER ONBOARDING PORTAL', pageWidth / 2, y + 4.5, { align: 'center' });

y += 10.5;

// Main Heading
doc.setFont('helvetica', 'bold');
doc.setFontSize(18);
doc.setTextColor(...DARK_SLATE);
doc.text('Buyer Account Registration Guide', pageWidth / 2, y, { align: 'center' });

y += 5.5;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.8);
doc.setTextColor(...MUTED);
doc.text('Complete the 3-stage verification process to participate in live scrap tenders & salvage asset bidding.', pageWidth / 2, y, { align: 'center' });

y += 8;

// Stepper visual on Page 1 (shows Step 1 Active)
y = drawWebsiteStepper(doc, y, 1);

y += 8;

// Why Register as a Buyer Card
doc.setFillColor(...SLATE_BG);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, contentWidth, 36, 3, 3, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(...NAVY);
doc.text('Why Register on SalvageReef? (Exclusively for Buyers & Bidders)', margin + 7, y + 7.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(...BODY_TEXT);
const perks = [
  '• Direct Factory Tenders: Bid directly on dismantled plant machinery, manufacturing scrap, PE coils, and metal lots.',
  '• 100% Genuine Corporate Sellers: Every auction is verified by SalvageReef desk with official inspection PDFs & site visits.',
  '• Live Bidding Feed: Real-time price updates with transparent H1 (Highest Bidder) ranking visible during the auction.',
  '• 100% EMD Safety: Full refund of your Earnest Money Deposit directly to your bank account if you do not win the lot.',
];
let perkY = y + 14;
perks.forEach((p) => {
  doc.text(p, margin + 7, perkY);
  perkY += 5;
});

y += 42;

// Section Header: Required Documents
doc.setFont('helvetica', 'bold');
doc.setFontSize(11.5);
doc.setTextColor(...NAVY);
doc.text('3 Documents Required for Verification (Keep Ready on Your Phone)', margin, y);

y += 4;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(...MUTED);
doc.text('To ensure genuine commercial bidding and tax compliance, buyers upload these 3 proofs in Stage 2:', margin, y);

y += 6.5;

// 3 Dropzone-style cards mimicking the website upload boxes
const docCards = [
  {
    num: '1',
    badge: 'IDENTITY PROOF',
    title: 'PAN Card Proof *',
    sub: 'Business or Proprietor PAN',
    desc: 'Clear photo or PDF of your 10-digit PAN card (e.g. ABCDE1234F). Used for buyer identity & tax records.',
    buttonText: 'Browse / Upload PAN',
  },
  {
    num: '2',
    badge: 'BUSINESS PROOF',
    title: 'GST Certificate *',
    sub: 'Form GST REG-06',
    desc: 'Government 15-digit GST Registration Certificate. Required to issue commercial scrap sale tax invoices.',
    buttonText: 'Browse / Upload GST',
  },
  {
    num: '3',
    badge: 'BANKING PROOF',
    title: 'Cancelled Cheque *',
    sub: 'Or Bank Passbook Photo',
    desc: 'Cancelled cheque showing Account Number & IFSC. Used for secure identity and prompt EMD refunds.',
    buttonText: 'Browse / Upload Cheque',
  },
];

const cardW = (contentWidth - 8) / 3;
docCards.forEach((card, idx) => {
  const cardX = margin + idx * (cardW + 4);
  const cardH = 59;

  // White Box with border
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(cardX, y, cardW, cardH, 3, 3, 'FD');

  // Pill badge
  doc.setFillColor(...SLATE_BG);
  doc.roundedRect(cardX + 5, y + 5, cardW - 10, 5, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...GOLD);
  doc.text(card.badge, cardX + cardW / 2, y + 8.5, { align: 'center' });

  // Title
  doc.setTextColor(...DARK_SLATE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(card.title, cardX + cardW / 2, y + 17, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(card.sub, cardX + cardW / 2, y + 22, { align: 'center' });

  // Description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...BODY_TEXT);
  const splitDesc = doc.splitTextToSize(card.desc, cardW - 10);
  doc.text(splitDesc, cardX + 5, y + 28);

  // Mock Upload Button
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(cardX + 6, y + cardH - 12, cardW - 12, 7.5, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...DARK_SLATE);
  doc.text(card.buttonText, cardX + cardW / 2, y + cardH - 7, { align: 'center' });
});

y += 66;

// Emerald Pro-Tips Banner
doc.setFillColor(...EMERALD_BG);
doc.setDrawColor(167, 243, 208);
doc.roundedRect(margin, y, contentWidth, 31, 3, 3, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(6, 95, 70);
doc.text('3 Simple Tips for Instant 10-Minute Approval:', margin + 6, y + 6.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(4, 120, 87);
const tips = [
  '1. Sharp Photos: Take a clear photo in good daylight. Make sure numbers and names are easy to read.',
  '2. Matching Details: The firm name entered in Step 1 should match the legal name on your GST certificate.',
  '3. File Size Under 5 MB: Standard mobile camera photos and scanned PDFs work smoothly.',
];
let tY = y + 12.5;
tips.forEach((t) => {
  doc.text(t, margin + 6, tY);
  tY += 5.5;
});

// ============================================================================
// PAGE 2: STEP-BY-STEP FORM WALKTHROUGH & REVIEW SUMMARY
// ============================================================================
doc.addPage();
drawPageHeader(doc, 2);

y = 31;

doc.setFont('helvetica', 'bold');
doc.setFontSize(15);
doc.setTextColor(...NAVY);
doc.text('Stage-by-Stage Form Walkthrough', margin, y);

y += 5;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(...MUTED);
doc.text('Visit https://salvagereef.com/register on any mobile browser or laptop.', margin, y);

y += 7;

// Stepper showing Step 2 Active
y = drawWebsiteStepper(doc, y, 2);

y += 7;

// STAGE 1 & 2 DUAL COLUMNS
const colWidth = (contentWidth - 6) / 2;

// Column 1: Stage 1 Details
doc.setFillColor(...WHITE);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, colWidth, 70, 3, 3, 'FD');

doc.setFillColor(...NAVY);
doc.roundedRect(margin, y, colWidth, 7, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...WHITE);
doc.text('STAGE 1 : BASIC & CONTACT DETAILS', margin + 6, y + 4.8);

let c1Y = y + 12;
const s1Fields = [
  ['Country', 'India (+91) or International dial code'],
  ['Firm / Vendor Name', 'Full registered firm name (e.g. Shyam Traders)'],
  ['Entity Type', 'Proprietorship, Partnership, Pvt Ltd, LLP'],
  ['PAN Number', '10 characters (e.g. ABCDE1234F)'],
  ['GST Number', '15-digit GSTIN (e.g. 27ABCDE1234F1Z5)'],
  ['Business Address', 'Registered office address, City, State, Pincode'],
  ['SPOC Name', 'Primary contact person / decision maker'],
  ['Mobile & Email', 'Active mobile number & email for notifications'],
  ['Password', 'Create secure password (min 6 characters)'],
];

s1Fields.forEach(([label, desc]) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK_SLATE);
  doc.text(`• ${label}:`, margin + 5, c1Y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...MUTED);
  doc.text(desc, margin + 35, c1Y);

  c1Y += 6.2;
});

// Column 2: Stage 2 Bank & Uploads
const col2X = margin + colWidth + 6;
doc.setFillColor(...WHITE);
doc.setDrawColor(...BORDER);
doc.roundedRect(col2X, y, colWidth, 70, 3, 3, 'FD');

doc.setFillColor(...GOLD);
doc.roundedRect(col2X, y, colWidth, 7, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...WHITE);
doc.text('STAGE 2 : BANK DETAILS & UPLOADS', col2X + 6, y + 4.8);

let c2Y = y + 12;
const s2Fields = [
  ['Bank Name', 'Your bank name (e.g. HDFC, SBI, ICICI, PNB)'],
  ['Account Number', 'Current / Business bank account (9-18 digits)'],
  ['IFSC Code', '11-digit bank branch code (e.g. HDFC0001234)'],
  ['PAN Card Upload', 'Select file -> Auto-compressed in 1 second'],
  ['GST Upload', 'Select file -> Form GST REG-06 proof'],
  ['Cheque Upload', 'Select file -> Cancelled cheque / passbook'],
];

s2Fields.forEach(([label, desc]) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK_SLATE);
  doc.text(`✓ ${label}:`, col2X + 5, c2Y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...MUTED);
  doc.text(desc, col2X + 33, c2Y);

  c2Y += 6.8;
});

// Upload Security Note
doc.setFillColor(...SLATE_BG);
doc.roundedRect(col2X + 4, c2Y, colWidth - 8, 15, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.2);
doc.setTextColor(...EMERALD);
doc.text('✓ Auto-Optimized Upload Engine:', col2X + 7, c2Y + 4.5);
doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(...BODY_TEXT);
doc.text('Documents are auto-compressed on your phone to ~200 KB', col2X + 7, c2Y + 8.5);
doc.text('for superfast uploads even on 3G/4G connections.', col2X + 7, c2Y + 12);

y += 75;

// STAGE 3: RECREATION OF THE WEBSITE REVIEW SUMMARY CARD
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(...NAVY);
doc.text('Stage 3: Review Summary & Acceptance (What You See on Screen)', margin, y);

y += 4.5;

// The Review Summary Card (Exact layout as shown on website)
doc.setFillColor(...SLATE_BG);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, contentWidth, 52, 3, 3, 'FD');

// Header inside card
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(...DARK_SLATE);
doc.text('REVIEW SUMMARY & TERMS', margin + 6, y + 6);

// Summary Grid (3 columns x 3 rows)
const gridStartY = y + 13;
const colGridW = (contentWidth - 12) / 3;

const summaryItems = [
  { label: 'VENDOR NAME', val: 'Shree Shyam Traders', bold: true },
  { label: 'ENTITY TYPE', val: 'Proprietorship', bold: true },
  { label: 'GST NUMBER', val: '06EHYPK7800M1ZK', bold: true, color: GOLD },

  { label: 'PAN NUMBER', val: 'EHYPK7800M', bold: true },
  { label: 'SPOC / CONTACT PERSON', val: 'Kapil / Manager', bold: true },
  { label: 'MOBILE & EMAIL', val: '7900071109 / kapilwm@gmail.com', bold: false },

  { label: 'BANK NAME', val: 'HDFC Bank', bold: true },
  { label: 'ACCOUNT & IFSC', val: '50200099094159 / HDFC0004372', bold: false },
  { label: 'LOCATION', val: 'Jind, Haryana / Mumbai', bold: false },
];

summaryItems.forEach((item, i) => {
  const colIndex = i % 3;
  const rowIndex = Math.floor(i / 3);
  const cellX = margin + 6 + colIndex * colGridW;
  const cellY = gridStartY + rowIndex * 9.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...MUTED);
  doc.text(item.label, cellX, cellY);

  doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
  doc.setFontSize(7.8);
  if (item.color) {
    doc.setTextColor(...item.color);
  } else {
    doc.setTextColor(...DARK_SLATE);
  }
  doc.text(item.val, cellX, cellY + 4);
});

// Badges Row for attached proofs
const badgeRowY = gridStartY + 30;
doc.setFont('helvetica', 'bold');
doc.setFontSize(6.5);
doc.setTextColor(...MUTED);
doc.text('UPLOADED VERIFICATION PROOFS:', margin + 6, badgeRowY - 1);

const proofs = ['✓ PAN Card Attached', '✓ GST Certificate Attached', '✓ Cancelled Cheque Attached'];
proofs.forEach((p, idx) => {
  const badgeX = margin + 6 + idx * 56;
  doc.setFillColor(...EMERALD_BG);
  doc.roundedRect(badgeX, badgeRowY + 1, 52, 5.5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(21, 128, 61);
  doc.text(p, badgeX + 26, badgeRowY + 4.8, { align: 'center' });
});

y += 56;

// Terms Checkbox & Complete Registration Button
doc.setFillColor(...AMBER_BG);
doc.setDrawColor(...AMBER_BORDER);
doc.roundedRect(margin, y, contentWidth, 26, 2.5, 2.5, 'FD');

// Checkbox square
doc.setFillColor(...GOLD);
doc.roundedRect(margin + 6, y + 4.5, 4.5, 4.5, 1, 1, 'F');
doc.setTextColor(...WHITE);
doc.setFont('helvetica', 'bold');
doc.setFontSize(7);
doc.text('✓', margin + 8.25, y + 7.8, { align: 'center' });

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...DARK_SLATE);
doc.text('Accept Terms & Conditions *', margin + 14, y + 8);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(...BODY_TEXT);
doc.text('I hereby declare that all business vendor information, including GSTIN and Bank details, provided above is true and authentic.', margin + 14, y + 13.5);
doc.text('I agree to abide by SalvageReef Tender Bidding Rules, EMD policies, and General Conditions of Sale.', margin + 14, y + 17.5);

// The Gold "Complete Registration" Button
const btnW = 75;
const btnX = pageWidth - margin - btnW - 6;
const btnY = y + 18.5;

// ============================================================================
// PAGE 3: WHAT HAPPENS NEXT — APPROVAL, DASHBOARD & HOW TO BID
// ============================================================================
doc.addPage();
drawPageHeader(doc, 3);

y = 31;

doc.setFont('helvetica', 'bold');
doc.setFontSize(15);
doc.setTextColor(...NAVY);
doc.text('After Registration: Approval, Login & How to Bid', margin, y);

y += 5;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(...MUTED);
doc.text('Your roadmap to bidding, winning, and picking up industrial scrap lots.', margin, y);

y += 7;

// Stepper showing Step 3 Complete
y = drawWebsiteStepper(doc, y, 3);

y += 7;

// Green Approval Card (mimicking the website's success card)
doc.setFillColor(240, 253, 244); // emerald-50
doc.setDrawColor(187, 247, 208);
doc.roundedRect(margin, y, contentWidth, 31, 3, 3, 'FD');

// Green Shield icon circle
doc.setFillColor(...EMERALD);
doc.circle(margin + 12, y + 15.5, 6.5, 'F');
doc.setTextColor(...WHITE);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.text('✓', margin + 12, y + 17.5, { align: 'center' });

doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(22, 101, 52);
doc.text('Registration Submitted for Admin Approval!', margin + 23, y + 10);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(21, 128, 61);
doc.text('Your vendor registration and KYC documents have been securely received.', margin + 23, y + 16);
doc.text('The SalvageReef desk reviews your application within 2 to 4 business hours.', margin + 23, y + 21);
doc.text('Once approved, your account is activated and you will receive your unique Login ID (e.g. SR-XXXXXX).', margin + 23, y + 26);

y += 37;

// 4-Step Action Timeline
const steps4 = [
  {
    step: '1',
    title: 'Sign In to Your Dashboard',
    desc: 'Go to https://salvagereef.com/login. Enter your registered Email or Login ID and password to access live lots.',
  },
  {
    step: '2',
    title: 'Browse Live Tenders & Download Dossiers',
    desc: 'Visit https://salvagereef.com/auctions. Review lot catalogs, photographs, and download technical inspection PDFs.',
  },
  {
    step: '3',
    title: 'Pay Lot EMD & Unlock Live Bidding',
    desc: 'Pay the Earnest Money Deposit (EMD) via bank transfer for the lots you want to bid on. EMD is 100% refundable if you do not win.',
  },
  {
    step: '4',
    title: 'Place Live Bids & Win the Auction',
    desc: 'Enter incremental bids in the live bidding feed. If your bid is highest at close (H1), you win! Complete payment & lift material.',
  },
];

steps4.forEach((s) => {
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(margin, y, contentWidth, 20.5, 2.5, 2.5, 'FD');

  // Step Number Badge
  doc.setFillColor(...NAVY);
  doc.roundedRect(margin + 4, y + 4, 16, 5.5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...WHITE);
  doc.text(`STEP ${s.step}`, margin + 12, y + 7.8, { align: 'center' });

  // Title
  doc.setTextColor(...DARK_SLATE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(s.title, margin + 24, y + 8);

  // Description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...BODY_TEXT);
  const wrapDesc = doc.splitTextToSize(s.desc, contentWidth - 30);
  doc.text(wrapDesc, margin + 24, y + 13.5);

  y += 24.5;
});

y += 2;

// Buyer Protection & EMD Guarantee Box
doc.setFillColor(...SLATE_BG);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, contentWidth, 27, 3, 3, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(...NAVY);
doc.text('Buyer Protection & Refund Policies:', margin + 6, y + 5.5);

const policies = [
  '• 100% EMD Refund: If you are not the highest bidder (H1), your full EMD is returned within 2 business days.',
  '• Inspection Rights: Buyers have full physical inspection rights at the factory warehouse before bidding closes.',
  '• Direct Invoicing: Material sale tax invoices are issued directly by the corporate seller in your firm name.',
];
let polY = y + 11;
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(...BODY_TEXT);
policies.forEach((pol) => {
  doc.text(pol, margin + 6, polY);
  polY += 5;
});

y += 31;

// Dedicated Support Card
doc.setFillColor(...NAVY);
doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'F');

doc.setTextColor(...WHITE);
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.text('Have Questions? Dedicated Buyer Desk Support', margin + 8, y + 7.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(203, 213, 225);
doc.text('Our executive desk is available to assist you with registration, KYC documents & bidding.', margin + 8, y + 13);

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.2);
doc.setTextColor(...GOLD);
doc.text('📞 Phone / WhatsApp: +91 7304481166', margin + 8, y + 20.5);
doc.text('✉️ Email: salvagereef@gmail.com', margin + 95, y + 20.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(...WHITE);
doc.text('🌐 Web: https://salvagereef.com/register', margin + 8, y + 24.5);
doc.text('🏢 Desk: Mumbai / Thane, Maharashtra', margin + 95, y + 24.5);

// ============================================================================
// SAVE HIGH-AESTHETIC PDF
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
