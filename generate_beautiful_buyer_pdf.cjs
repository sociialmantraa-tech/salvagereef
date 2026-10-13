#!/usr/bin/env node
/**
 * ============================================================================
 * SalvageReef — Executive Buyer Registration & Signup Manual (4-Page Edition)
 * ============================================================================
 * High-aesthetic PDF recreation of the official website registration portal:
 * - Authentic Brand Logo Emblem & Navy/Gold Typography
 * - 3-Stage Golden Stepper Header on every page (Basic -> Bank & Uploads -> Review)
 * - Realistic form input mockups matching the website's exact input fields & cards
 * - 3 upload dropzone cards with file size indicators & compression badges
 * - Exact replica of the Stage 3 Review Summary Card & Terms acceptance
 * - Green Admin Approval Confirmation Card & 4-Step Bidding Guide for Buyers
 * - Formatted strictly in simple, easy-to-understand language for buyers/bidders
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
const totalPages = 4;

// ─── Color Palette matching salvagereef.com ──────────────────────────────────
const NAVY = [11, 25, 44];          // #0B192C (Brand Deep Navy)
const DARK_SLATE = [15, 23, 42];    // #0F172A (Headings & Dark Elements)
const GOLD = [212, 139, 28];        // #D48B1C (Brand Amber / Gold)
const GOLD_HOVER = [184, 117, 20];  // #B87514 (Deep Gold)
const GOLD_LIGHT = [254, 243, 199]; // #FEF3C7 (Soft Amber Tint)
const GOLD_BORDER = [252, 211, 77]; // #FCD34D (Amber Accent Border)
const SLATE_BG = [248, 250, 252];   // #F8FAFC (Card Background)
const INPUT_BG = [241, 245, 249];   // #F1F5F9 (Input Box Background)
const BORDER = [226, 232, 240];     // #E2E8F0 (Card Border)
const INPUT_BORDER = [203, 213, 225];// #CBD5E1 (Input Border)
const WHITE = [255, 255, 255];
const BODY_TEXT = [51, 65, 85];     // #334155 (Readability Charcoal)
const MUTED = [100, 116, 139];      // #64748B (Secondary / Muted Text)
const EMERALD = [16, 185, 129];     // #10B981 (Success Emerald)
const EMERALD_DARK = [5, 150, 105]; // #059669
const EMERALD_BG = [236, 253, 245]; // #ECFDF5 (Success Light Tint)
const EMERALD_BORDER = [167, 243, 208]; // #A7F3D0

// Read Brand Logo Emblem (PNG)
let logoBase64 = null;
const logoPath = path.join(__dirname, 'frontend', 'public', 'logo.png');
if (fs.existsSync(logoPath)) {
  logoBase64 = 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64');
}

// ─── Reusable Top Header Bar ────────────────────────────────────────────────
function drawPageHeader(doc, pageNumber) {
  // Deep Navy Brand Bar
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Golden accent bottom border line
  doc.setFillColor(...GOLD);
  doc.rect(0, 24, pageWidth, 1.2, 'F');

  // Embed Logo Emblem if available
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', margin, 4, 12.5, 16);
    } catch {}
  }

  const titleX = logoBase64 ? margin + 15 : margin;

  // Brand Name
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.text('SalvageReef', titleX, 11.5);

  // Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...GOLD);
  doc.text('AUCTIONS & CLASSIFIEDS  •  B2B TENDER PORTAL', titleX, 17);

  // Right Header Info
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('BUYER ONBOARDING GUIDE', pageWidth - margin, 11, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Website: salvagereef.com  |  Helpline: +91 7304481166', pageWidth - margin, 17, { align: 'right' });

  // Bottom Footer
  doc.setFillColor(...NAVY);
  doc.rect(0, pageHeight - 10.5, pageWidth, 10.5, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(203, 213, 225);
  doc.text('SalvageReef Operations Desk  •  Official Buyer & Bidder Verification Manual', margin, pageHeight - 4.2);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GOLD);
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 4.2, { align: 'right' });
}

// ─── Signature 3-Stage Stepper Header (Website Component) ───────────────────
function drawWebsiteStepper(doc, startY, activeStep = 1) {
  const stepperH = 22;
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(margin, startY, contentWidth, stepperH, 3.5, 3.5, 'FD');

  const step1X = margin + 30;
  const step2X = margin + contentWidth / 2;
  const step3X = margin + contentWidth - 30;
  const lineY = startY + 8.5;

  // Background connecting line (slate-200)
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(step1X, lineY, step3X, lineY);

  // Active golden progress line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.4);
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

    if (isCompleted) {
      doc.setFillColor(...GOLD);
      doc.circle(s.x, lineY, 4.8, 'F');
      doc.setTextColor(...WHITE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('✓', s.x, lineY + 1.2, { align: 'center' });
    } else if (isCurrent) {
      // Glow outer ring
      doc.setDrawColor(252, 211, 77);
      doc.setLineWidth(1.5);
      doc.circle(s.x, lineY, 5.5, 'D');

      doc.setFillColor(...GOLD);
      doc.circle(s.x, lineY, 4.5, 'F');
      doc.setTextColor(...WHITE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(s.num, s.x, lineY + 1.2, { align: 'center' });
    } else {
      doc.setFillColor(226, 232, 240);
      doc.circle(s.x, lineY, 4.5, 'F');
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
    doc.text(s.title, s.x, startY + 17.5, { align: 'center' });
  });

  return startY + stepperH;
}

// ─── Realistic Form Input Mockup Drawer ─────────────────────────────────────
function drawInputMockup(doc, x, y, width, height, label, value, options = {}) {
  const { isDropdown = false, hasCheck = true, isMonospace = false, isPassword = false } = options;

  // Label above input
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...DARK_SLATE);
  doc.text(label, x, y);

  const inputY = y + 2;
  const inputH = height - 2;

  // Input Box (white with crisp subtle border)
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...INPUT_BORDER);
  doc.setLineWidth(0.4);
  doc.roundedRect(x, inputY, width, inputH, 2, 2, 'FD');

  // Input Value Text
  doc.setFont(isMonospace ? 'courier' : 'helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...DARK_SLATE);

  let displayVal = value;
  if (isPassword) {
    displayVal = '••••••••••••';
  }

  // Clip text if too long
  const maxChars = Math.floor(width / 2.2);
  if (displayVal.length > maxChars) {
    displayVal = displayVal.substring(0, maxChars - 3) + '...';
  }
  doc.text(displayVal, x + 3.5, inputY + inputH / 2 + 1.2);

  // Trailing indicator: Dropdown arrow or Green checkmark
  if (isDropdown) {
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('▾', x + width - 5, inputY + inputH / 2 + 1);
  } else if (hasCheck) {
    doc.setTextColor(...EMERALD_DARK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('✓', x + width - 5, inputY + inputH / 2 + 1);
  } else if (isPassword) {
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('👁', x + width - 6, inputY + inputH / 2 + 1);
  }
}

// ============================================================================
// PAGE 1: PORTAL HERO, BUYER PERKS & 3 REQUIRED KYC DOCUMENTS
// ============================================================================
drawPageHeader(doc, 1);

let y = 29;

// "SALVAGE BUYER ONBOARDING PORTAL" Pill Badge (Identical to Website)
doc.setFillColor(...GOLD_LIGHT);
doc.setDrawColor(...GOLD_BORDER);
doc.roundedRect(pageWidth / 2 - 42, y, 84, 6.5, 3.25, 3.25, 'FD');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...GOLD);
doc.text('SALVAGE BUYER ONBOARDING PORTAL', pageWidth / 2, y + 4.5, { align: 'center' });

y += 10.5;

// Main Heading
doc.setFont('helvetica', 'bold');
doc.setFontSize(17.5);
doc.setTextColor(...DARK_SLATE);
doc.text('Buyer Account Registration Guide', pageWidth / 2, y, { align: 'center' });

y += 5.2;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.6);
doc.setTextColor(...MUTED);
doc.text('Complete the 3-stage verification process to participate in live scrap tenders & salvage asset bidding.', pageWidth / 2, y, { align: 'center' });

y += 7.5;

// Stepper visual on Page 1 (shows Step 1 Active)
y = drawWebsiteStepper(doc, y, 1);

y += 7.5;

// "Why Register as a Buyer on SalvageReef?" Card
doc.setFillColor(...SLATE_BG);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, contentWidth, 38, 3, 3, 'FD');

// Header strip inside card
doc.setFillColor(...NAVY);
doc.roundedRect(margin, y, contentWidth, 7, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...WHITE);
doc.text('WHY REGISTER ON SALVAGEREEF? (EXCLUSIVELY FOR BUYERS & BIDDERS)', margin + 6, y + 4.8);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(...BODY_TEXT);
const perks = [
  '• Direct Factory Tenders: Bid directly on dismantled plant machinery, manufacturing scrap, PE coils, and metal lots.',
  '• 100% Genuine Corporate Sellers: Every auction is verified by SalvageReef desk with official inspection PDFs & site visits.',
  '• Live Bidding Feed: Real-time price updates with transparent H1 (Highest Bidder) ranking visible during the auction.',
  '• 100% EMD Safety Guarantee: Full refund of your Earnest Money Deposit directly to your bank account if you do not win.',
];
let perkY = y + 13.5;
perks.forEach((p) => {
  doc.text(p, margin + 6, perkY);
  perkY += 5.5;
});

y += 44;

// Section Header: Required Documents
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(...NAVY);
doc.text('3 Documents Required for Verification (Keep Ready on Your Phone / PC)', margin, y);

y += 3.8;
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(...MUTED);
doc.text('To ensure genuine commercial bidding and tax compliance, buyers upload these 3 proofs in Stage 2:', margin, y);

y += 6;

// 3 Dropzone-style cards mimicking the website upload boxes
const docCards = [
  {
    badge: 'IDENTITY PROOF',
    title: '1. PAN Card Proof *',
    sub: 'Business or Proprietor PAN',
    desc: 'Clear photo or PDF of your 10-digit PAN card. Required for bidder identity and income tax records.',
    buttonText: '📁 Browse / Upload PAN',
    fileNotice: 'JPG, PNG, PDF • Max 5MB',
  },
  {
    badge: 'BUSINESS PROOF',
    title: '2. GST Certificate *',
    sub: 'Form GST REG-06',
    desc: 'Government 15-digit GST Registration Certificate. Required to issue commercial scrap sale tax invoices.',
    buttonText: '📁 Browse / Upload GST',
    fileNotice: 'Official REG-06 Form',
  },
  {
    badge: 'BANKING PROOF',
    title: '3. Cancelled Cheque *',
    sub: 'Passbook / Cheque Copy',
    desc: 'Cancelled cheque showing Account Number & IFSC. Used for secure identity and prompt EMD refunds.',
    buttonText: '📁 Browse / Upload Cheque',
    fileNotice: 'Account Name Visible',
  },
];

const cardW = (contentWidth - 8) / 3;
const cardH = 68;

docCards.forEach((card, idx) => {
  const cardX = margin + idx * (cardW + 4);

  // White Box with dashed-style effect
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(cardX, y, cardW, cardH, 3, 3, 'FD');

  // Pill badge
  doc.setFillColor(...SLATE_BG);
  doc.roundedRect(cardX + 4, y + 4.5, cardW - 8, 5, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...GOLD);
  doc.text(card.badge, cardX + cardW / 2, y + 8, { align: 'center' });

  // Title
  doc.setTextColor(...DARK_SLATE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(card.title, cardX + cardW / 2, y + 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...MUTED);
  doc.text(card.sub, cardX + cardW / 2, y + 21, { align: 'center' });

  // Description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.3);
  doc.setTextColor(...BODY_TEXT);
  const splitDesc = doc.splitTextToSize(card.desc, cardW - 8);
  doc.text(splitDesc, cardX + 4, y + 27);

  // File Notice
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...MUTED);
  doc.text(card.fileNotice, cardX + cardW / 2, y + cardH - 18, { align: 'center' });

  // Mock Upload Button
  doc.setFillColor(...SLATE_BG);
  doc.setDrawColor(...INPUT_BORDER);
  doc.roundedRect(cardX + 5, y + cardH - 12.5, cardW - 10, 8, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...DARK_SLATE);
  doc.text(card.buttonText, cardX + cardW / 2, y + cardH - 7.5, { align: 'center' });
});

y += cardH + 7;

// Emerald Pro-Tips Banner
doc.setFillColor(...EMERALD_BG);
doc.setDrawColor(...EMERALD_BORDER);
doc.roundedRect(margin, y, contentWidth, 29, 3, 3, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(...EMERALD_DARK);
doc.text('✓ 3 Simple Tips for Instant 10-Minute Verification Approval:', margin + 6, y + 6);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(4, 120, 87);
const tips = [
  '1. Sharp Daylight Photos: Take clear photos with your smartphone camera. Numbers and names must be easily readable.',
  '2. Matching Details: The Firm Name entered in Stage 1 must match the legal trade name on your GST certificate.',
  '3. File Size Under 5 MB: Standard photos and scanned PDFs work smoothly. Documents auto-compress on upload.',
];
let tY = y + 12;
tips.forEach((t) => {
  doc.text(t, margin + 6, tY);
  tY += 5;
});

// ============================================================================
// PAGE 2: STAGE 1 — BASIC & CONTACT DETAILS (WEBSITE FORM MOCKUP)
// ============================================================================
doc.addPage();
drawPageHeader(doc, 2);

y = 29;

doc.setFont('helvetica', 'bold');
doc.setFontSize(14.5);
doc.setTextColor(...NAVY);
doc.text('Stage 1 : Basic & Contact Details', margin, y);

y += 4.5;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(...MUTED);
doc.text('Website URL: https://salvagereef.com/register  •  Mobile & Desktop Compatible', margin, y);

y += 6.5;

// Stepper showing Step 1 Active
y = drawWebsiteStepper(doc, y, 1);

y += 7;

// Country / Operating Region Selection Box (Exact replica from website)
doc.setFillColor(...GOLD_LIGHT);
doc.setDrawColor(...GOLD_BORDER);
doc.roundedRect(margin, y, contentWidth, 16, 2.5, 2.5, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...NAVY);
doc.text('Country / Operating Region *', margin + 5, y + 6);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7);
doc.setTextColor(...BODY_TEXT);
doc.text('Select your business country. Rules and dialing codes adapt automatically.', margin + 5, y + 11.5);

// Selector mockup on right
const cSelW = 75;
const cSelX = pageWidth - margin - cSelW - 4;
doc.setFillColor(...WHITE);
doc.setDrawColor(...GOLD);
doc.roundedRect(cSelX, y + 3.5, cSelW, 9, 2, 2, 'FD');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...DARK_SLATE);
doc.text('🇮🇳 India (+91)', cSelX + 4, y + 9.5);
doc.setTextColor(...GOLD);
doc.text('▾', cSelX + cSelW - 6, y + 9.5);

y += 21;

// Section Banner
doc.setFillColor(...NAVY);
doc.roundedRect(margin, y, contentWidth, 7, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...WHITE);
doc.text('WEBSITE FORM INPUTS (STAGE 1 : BASIC INFORMATION)', margin + 6, y + 4.8);

y += 10.5;

// 10 Mockup Input Fields (2 Columns of 5 fields each)
const colW = (contentWidth - 6) / 2;
const col1X = margin;
const col2X = margin + colW + 6;
const fieldH = 13.5;

// Column 1 Fields
const col1Fields = [
  { label: 'Vendor / Firm Name *', val: 'Shree Shyam Metals & Scraps', opts: { hasCheck: true } },
  { label: 'Entity Type *', val: 'Proprietorship', opts: { isDropdown: true } },
  { label: 'PAN Number (10 digits) *', val: 'ABCDE1234F', opts: { isMonospace: true, hasCheck: true } },
  { label: 'GST Number (15 digits) *', val: '27ABCDE1234F1Z5', opts: { isMonospace: true, hasCheck: true } },
  { label: 'Registered Business Address *', val: 'Plot 42, MIDC Industrial Area, Taloja', opts: { hasCheck: true } },
];

let curY1 = y;
col1Fields.forEach((f) => {
  drawInputMockup(doc, col1X, curY1, colW, fieldH, f.label, f.val, f.opts);
  curY1 += fieldH + 4;
});

// Column 2 Fields
const col2Fields = [
  { label: 'State & City *', val: 'Maharashtra / Navi Mumbai (PIN: 410208)', opts: { hasCheck: true } },
  { label: 'SPOC / Contact Person Name *', val: 'Ramesh Sharma (Proprietor)', opts: { hasCheck: true } },
  { label: 'Mobile Number *', val: '+91 98201 23456', opts: { isMonospace: true, hasCheck: true } },
  { label: 'Official Email ID *', val: 'ramesh@shyammetals.com', opts: { hasCheck: true } },
  { label: 'Create Account Password *', val: 'SecurePass@2026', opts: { isPassword: true } },
];

let curY2 = y;
col2Fields.forEach((f) => {
  drawInputMockup(doc, col2X, curY2, colW, fieldH, f.label, f.val, f.opts);
  curY2 += fieldH + 4;
});

y = Math.max(curY1, curY2) + 2;

// Mock "Next: Bank & Document Uploads" Button (Exact button styling from website)
doc.setFillColor(...GOLD);
doc.roundedRect(margin, y, contentWidth, 10, 2.5, 2.5, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...WHITE);
doc.text('NEXT: BANK & DOCUMENT UPLOADS  →', pageWidth / 2, y + 6.5, { align: 'center' });

y += 15.5;

// Helpful Field Explanations Card (Plain English for Buyers)
doc.setFillColor(...SLATE_BG);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, contentWidth, 42, 3, 3, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...NAVY);
doc.text('Helpful Field Notes for Buyers & Bidders:', margin + 6, y + 6);

const notes = [
  '• Firm Name: Enter the exact legal name of your business as registered on your GST certificate.',
  '• Entity Type: Choose whether your firm is a Proprietorship, Partnership, Private Limited, or LLP.',
  '• SPOC Person: Single Point of Contact — the primary authorized person who will place bids and receive lot updates.',
  '• Mobile & Email: You will receive lot winning notifications, inspection site passes, and delivery order alerts here.',
  '• Password: Must be at least 6 characters. You will use this password to log in and participate in live scrap bidding.',
];
let nY = y + 12;
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(...BODY_TEXT);
notes.forEach((note) => {
  doc.text(note, margin + 6, nY);
  nY += 5.5;
});

// ============================================================================
// PAGE 3: STAGE 2 — BANK DETAILS & KYC UPLOADS (WEBSITE FORM MOCKUP)
// ============================================================================
doc.addPage();
drawPageHeader(doc, 3);

y = 29;

doc.setFont('helvetica', 'bold');
doc.setFontSize(14.5);
doc.setTextColor(...NAVY);
doc.text('Stage 2 : Bank Details & Document Uploads', margin, y);

y += 4.5;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(...MUTED);
doc.text('Your bank details ensure prompt 100% EMD refunds and transparent commercial billing.', margin, y);

y += 6.5;

// Stepper showing Step 2 Active
y = drawWebsiteStepper(doc, y, 2);

y += 7;

// Banking Information Banner
doc.setFillColor(...NAVY);
doc.roundedRect(margin, y, contentWidth, 7, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...WHITE);
doc.text('BANK ACCOUNT INFORMATION (FOR IDENTITY & EMD REFUNDS)', margin + 6, y + 4.8);

y += 10.5;

// 3 Bank Inputs (3 columns across)
const bankColW = (contentWidth - 8) / 3;
const bInputs = [
  { label: 'Bank Name *', val: 'HDFC Bank Limited', opts: { hasCheck: true } },
  { label: 'Account Number *', val: '50200099094159', opts: { isMonospace: true, hasCheck: true } },
  { label: 'IFSC Code (11 digits) *', val: 'HDFC0004372', opts: { isMonospace: true, hasCheck: true } },
];

bInputs.forEach((b, idx) => {
  const bX = margin + idx * (bankColW + 4);
  drawInputMockup(doc, bX, y, bankColW, 13.5, b.label, b.val, b.opts);
});

y += 18;

// Section Banner: Upload Verification Documents
doc.setFillColor(...GOLD);
doc.roundedRect(margin, y, contentWidth, 7, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...WHITE);
doc.text('UPLOAD VERIFICATION DOCUMENTS (MOCKUP OF ATTACHED PROOFS)', margin + 6, y + 4.8);

y += 10.5;

// 3 Realistic Upload Cards (showing what it looks like when uploaded on the website)
const uploadMockups = [
  {
    num: '1',
    title: '1. PAN Card Copy *',
    sub: 'Business or Proprietor PAN',
    fileName: 'pan_card_copy.pdf',
    fileSize: '185 KB',
  },
  {
    num: '2',
    title: '2. GST Certificate *',
    sub: 'Form GST REG-06',
    fileName: 'gst_reg06_cert.pdf',
    fileSize: '290 KB',
  },
  {
    num: '3',
    title: '3. Cancelled Cheque *',
    sub: 'Passbook / Cheque Copy',
    fileName: 'cancelled_cheque.jpg',
    fileSize: '160 KB',
  },
];

const upCardW = (contentWidth - 8) / 3;
const upCardH = 46;

uploadMockups.forEach((u, idx) => {
  const uX = margin + idx * (upCardW + 4);

  // Card box
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(uX, y, upCardW, upCardH, 2.5, 2.5, 'FD');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK_SLATE);
  doc.text(u.title, uX + upCardW / 2, y + 7, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...MUTED);
  doc.text(u.sub, uX + upCardW / 2, y + 11.5, { align: 'center' });

  // Attached File Pill Badge (emerald)
  doc.setFillColor(...EMERALD_BG);
  doc.setDrawColor(...EMERALD_BORDER);
  doc.roundedRect(uX + 4, y + 16, upCardW - 8, 12, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...EMERALD_DARK);
  doc.text(`✓ ${u.fileName}`, uX + upCardW / 2, y + 21.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(...MUTED);
  doc.text(`Compressed Size: ${u.fileSize}`, uX + upCardW / 2, y + 25.5, { align: 'center' });

  // "Change File" button on bottom
  doc.setFillColor(...SLATE_BG);
  doc.setDrawColor(...INPUT_BORDER);
  doc.roundedRect(uX + 6, y + upCardH - 10, upCardW - 12, 6.5, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...BODY_TEXT);
  doc.text('Change File', uX + upCardW / 2, y + upCardH - 5.5, { align: 'center' });
});

y += upCardH + 6;

// Auto-Compression Feature Notice Box
doc.setFillColor(...EMERALD_BG);
doc.setDrawColor(...EMERALD_BORDER);
doc.roundedRect(margin, y, contentWidth, 20, 2.5, 2.5, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...EMERALD_DARK);
doc.text('✓ Auto-Optimized Upload Engine (Zero Timeout Errors):', margin + 6, y + 5.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(4, 120, 87);
doc.text('Your documents are automatically compressed on your smartphone or browser before sending.', margin + 6, y + 10.5);
doc.text('Uploads complete in less than 2 seconds, even on regular 3G / 4G connections.', margin + 6, y + 15);

y += 24;

// Mock Step Navigation Buttons
const prevBtnW = 45;
const nextBtnW = contentWidth - prevBtnW - 4;

// Previous Button
doc.setFillColor(241, 245, 249);
doc.setDrawColor(...INPUT_BORDER);
doc.roundedRect(margin, y, prevBtnW, 10, 2, 2, 'FD');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...BODY_TEXT);
doc.text('←  PREVIOUS', margin + prevBtnW / 2, y + 6.5, { align: 'center' });

// Next Button
doc.setFillColor(...GOLD);
doc.roundedRect(margin + prevBtnW + 4, y, nextBtnW, 10, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...WHITE);
doc.text('NEXT: TERMS & REVIEW  →', margin + prevBtnW + 4 + nextBtnW / 2, y + 6.5, { align: 'center' });

y += 15;

// Why Bank Details are Required Box
doc.setFillColor(...SLATE_BG);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, contentWidth, 31, 3, 3, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...NAVY);
doc.text('Why Are Bank Details Required for Buyers?', margin + 6, y + 6);

const bankFaqs = [
  '• 100% EMD Refund Guarantee: If you participate in an auction but are outbid (not H1), your EMD is refunded to this account.',
  '• Account Matching: The bank account name should match your business entity or proprietor name.',
  '• Secure Data: SalvageReef uses encrypted bank storage strictly for verified bidder payments and refunds.',
];
let bqY = y + 11.5;
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(...BODY_TEXT);
bankFaqs.forEach((bf) => {
  doc.text(bf, margin + 6, bqY);
  bqY += 5.5;
});

// ============================================================================
// PAGE 4: STAGE 3 — REVIEW SUMMARY, APPROVAL & HOW TO BID ON AUCTIONS
// ============================================================================
doc.addPage();
drawPageHeader(doc, 4);

y = 29;

doc.setFont('helvetica', 'bold');
doc.setFontSize(14.5);
doc.setTextColor(...NAVY);
doc.text('Stage 3 : Review Summary & What Happens Next', margin, y);

y += 4.5;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(...MUTED);
doc.text('Verify your details, accept bidding terms, and submit for instant admin verification.', margin, y);

y += 6.5;

// Stepper showing Step 3 Complete
y = drawWebsiteStepper(doc, y, 3);

y += 6.5;

// STAGE 3: EXACT RECREATION OF THE WEBSITE REVIEW SUMMARY CARD
doc.setFillColor(...SLATE_BG);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, contentWidth, 48, 3, 3, 'FD');

// Header inside card
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...DARK_SLATE);
doc.text('REVIEW SUMMARY & TERMS', margin + 6, y + 5.5);

// Summary Grid (3 columns x 3 rows)
const gridStartY = y + 11;
const colGridW = (contentWidth - 12) / 3;

const summaryItems = [
  { label: 'VENDOR NAME', val: 'Shree Shyam Metals & Scraps', bold: true },
  { label: 'ENTITY TYPE', val: 'Proprietorship', bold: true },
  { label: 'GST NUMBER', val: '27ABCDE1234F1Z5', bold: true, color: GOLD },

  { label: 'PAN NUMBER', val: 'ABCDE1234F', bold: true },
  { label: 'SPOC / CONTACT PERSON', val: 'Ramesh Sharma (Proprietor)', bold: true },
  { label: 'MOBILE & EMAIL', val: '+91 98201 23456 / ramesh@shyammetals.com', bold: false },

  { label: 'BANK NAME', val: 'HDFC Bank Limited', bold: true },
  { label: 'ACCOUNT & IFSC', val: '50200099094159 / HDFC0004372', bold: false },
  { label: 'LOCATION', val: 'Navi Mumbai, Maharashtra - 410208', bold: false },
];

summaryItems.forEach((item, i) => {
  const colIndex = i % 3;
  const rowIndex = Math.floor(i / 3);
  const cellX = margin + 6 + colIndex * colGridW;
  const cellY = gridStartY + rowIndex * 8.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(...MUTED);
  doc.text(item.label, cellX, cellY);

  doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
  doc.setFontSize(7.5);
  if (item.color) {
    doc.setTextColor(...item.color);
  } else {
    doc.setTextColor(...DARK_SLATE);
  }
  doc.text(item.val, cellX, cellY + 3.8);
});

// Badges Row for attached proofs
const badgeRowY = gridStartY + 27;
doc.setFont('helvetica', 'bold');
doc.setFontSize(6.2);
doc.setTextColor(...MUTED);
doc.text('UPLOADED VERIFICATION PROOFS:', margin + 6, badgeRowY - 1);

const proofs = ['✓ PAN Card Attached', '✓ GST Certificate Attached', '✓ Cancelled Cheque Attached'];
proofs.forEach((p, idx) => {
  const badgeX = margin + 6 + idx * 56;
  doc.setFillColor(...EMERALD_BG);
  doc.setDrawColor(...EMERALD_BORDER);
  doc.roundedRect(badgeX, badgeRowY + 1, 52, 5, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...EMERALD_DARK);
  doc.text(p, badgeX + 26, badgeRowY + 4.5, { align: 'center' });
});

y += 52;

// Terms Checkbox & Complete Registration Button
doc.setFillColor(...GOLD_LIGHT);
doc.setDrawColor(...GOLD_BORDER);
doc.roundedRect(margin, y, contentWidth, 23, 2.5, 2.5, 'FD');

// Checkbox square
doc.setFillColor(...GOLD);
doc.roundedRect(margin + 5, y + 4, 4.5, 4.5, 1, 1, 'F');
doc.setTextColor(...WHITE);
doc.setFont('helvetica', 'bold');
doc.setFontSize(7);
doc.text('✓', margin + 7.25, y + 7.2, { align: 'center' });

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.2);
doc.setTextColor(...DARK_SLATE);
doc.text('Accept Terms & Conditions *', margin + 12, y + 7.2);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7);
doc.setTextColor(...BODY_TEXT);
doc.text('I declare that all vendor information, GSTIN (27ABCDE1234F1Z5) and Bank details provided above are authentic.', margin + 12, y + 12);
doc.text('I agree to abide by SalvageReef Tender Bidding Rules, EMD refund policies, and General Conditions of Sale.', margin + 12, y + 16);

// Complete Registration Button on Right
const regBtnW = 60;
const regBtnX = pageWidth - margin - regBtnW - 4;
doc.setFillColor(...GOLD);
doc.roundedRect(regBtnX, y + 5, regBtnW, 13, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...WHITE);
doc.text('COMPLETE REGISTRATION  →', regBtnX + regBtnW / 2, y + 13, { align: 'center' });

y += 27;

// Green Approval Card (Exact replica of website's success card)
doc.setFillColor(...EMERALD_BG);
doc.setDrawColor(...EMERALD_BORDER);
doc.roundedRect(margin, y, contentWidth, 25, 3, 3, 'FD');

// Green Shield icon circle
doc.setFillColor(...EMERALD);
doc.circle(margin + 10, y + 12.5, 5.5, 'F');
doc.setTextColor(...WHITE);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.text('✓', margin + 10, y + 14.5, { align: 'center' });

doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(22, 101, 52);
doc.text('Registration Submitted for Admin Approval!', margin + 19, y + 7.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.3);
doc.setTextColor(21, 128, 61);
doc.text('Your vendor registration and submitted KYC documents have been received.', margin + 19, y + 12.5);
doc.text('The SalvageReef desk reviews your application within 2 to 4 business hours.', margin + 19, y + 16.5);
doc.text('Once approved, your account is activated and you will receive your unique Login ID (e.g. SR-XXXXXX).', margin + 19, y + 20.5);

y += 29;

// 4-Step Action Roadmap for Buyers
const steps4 = [
  { step: '1', title: 'Sign In to Dashboard', desc: 'Visit salvagereef.com/login with your email or Login ID and password.' },
  { step: '2', title: 'Browse Live Tenders', desc: 'View lot photos, catalogs & download official technical inspection PDFs.' },
  { step: '3', title: 'Pay Lot EMD', desc: 'Pay Earnest Money Deposit for desired lots (100% refundable if outbid).' },
  { step: '4', title: 'Place Live Bids & Win', desc: 'Enter bids in live feed. Highest bid at close (H1) wins lot for lifting.' },
];

const stW = (contentWidth - 9) / 4;
steps4.forEach((st, idx) => {
  const stX = margin + idx * (stW + 3);
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(stX, y, stW, 25, 2, 2, 'FD');

  doc.setFillColor(...NAVY);
  doc.roundedRect(stX + 3, y + 3, 14, 4.5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(...WHITE);
  doc.text(`STEP ${st.step}`, stX + 10, y + 6.2, { align: 'center' });

  doc.setTextColor(...DARK_SLATE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text(st.title, stX + 3, y + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);
  doc.setTextColor(...BODY_TEXT);
  const wrapDesc = doc.splitTextToSize(st.desc, stW - 6);
  doc.text(wrapDesc, stX + 3, y + 15.5);
});

y += 29;

// Dedicated Support Card
doc.setFillColor(...NAVY);
doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

doc.setTextColor(...WHITE);
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.text('Have Questions? Dedicated Buyer Desk Support', margin + 7, y + 6.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(203, 213, 225);
doc.text('Our executive desk is available to assist you with registration, KYC documents & bidding.', margin + 7, y + 11.5);

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.8);
doc.setTextColor(...GOLD);
doc.text('📞 Phone / WhatsApp: +91 7304481166', margin + 7, y + 18);
doc.text('✉️ Email: salvagereef@gmail.com', margin + 90, y + 18);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7);
doc.setTextColor(...WHITE);
doc.text('🌐 Web: salvagereef.com/register', margin + 7, y + 21.8);
doc.text('🏢 Desk: Mumbai / Thane, Maharashtra', margin + 90, y + 21.8);

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
