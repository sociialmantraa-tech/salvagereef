#!/usr/bin/env node
/**
 * ============================================================================
 * SalvageReef — Executive Buyer Registration & Signup Manual (Instructional Edition)
 * ============================================================================
 * Zero demo data: every field and option explicitly instructs the buyer
 * WHAT THEY NEED TO WRITE OR SELECT:
 * - Dynamic text measurement & auto-wrapping on every bullet, title, and card
 * - Field-by-field instructions explaining exact formats (GSTIN, PAN, Bank, Address)
 * - Upload dropzones detailing exactly what document to attach and why
 * - Review summary showing how user's verified details will appear
 * - Clean two-column Terms acceptance with zero text collision
 * - 4-step post-registration guide for live scrap bidding
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
  const stepperH = 21;
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(margin, startY, contentWidth, stepperH, 3.5, 3.5, 'FD');

  const step1X = margin + 30;
  const step2X = margin + contentWidth / 2;
  const step3X = margin + contentWidth - 30;
  const lineY = startY + 8;

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
      doc.circle(s.x, lineY, 4.5, 'F');
      doc.setTextColor(...WHITE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('✓', s.x, lineY + 1.2, { align: 'center' });
    } else if (isCurrent) {
      // Glow outer ring
      doc.setDrawColor(252, 211, 77);
      doc.setLineWidth(1.2);
      doc.circle(s.x, lineY, 5.2, 'D');

      doc.setFillColor(...GOLD);
      doc.circle(s.x, lineY, 4.3, 'F');
      doc.setTextColor(...WHITE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(s.num, s.x, lineY + 1.2, { align: 'center' });
    } else {
      doc.setFillColor(226, 232, 240);
      doc.circle(s.x, lineY, 4.3, 'F');
      doc.setTextColor(...MUTED);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(s.num, s.x, lineY + 1.2, { align: 'center' });
    }

    // Step Title Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    if (isCurrent) {
      doc.setTextColor(...GOLD);
    } else if (isCompleted) {
      doc.setTextColor(...DARK_SLATE);
    } else {
      doc.setTextColor(...MUTED);
    }
    doc.text(s.title, s.x, startY + 16.8, { align: 'center' });
  });

  return startY + stepperH;
}

// ─── Safe Text Drawing Helper with Auto-Wrapping ────────────────────────────
function drawSafeWrappedText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((l, idx) => {
    doc.text(l, x, y + idx * lineHeight);
  });
  return y + lines.length * lineHeight;
}

// ─── Instructional Form Input Mockup Drawer ─────────────────────────────────
// Displays clear guidance on what the buyer needs to enter or select
function drawInputMockup(doc, x, y, width, height, label, instructionText, options = {}) {
  const { isDropdown = false, badgeText = 'Required', isMonospace = false } = options;

  // Label above input
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...DARK_SLATE);
  doc.text(label, x, y);

  const inputY = y + 2.2;
  const inputH = height - 2.2;

  // Input Box (slate-50 background with clean border)
  doc.setFillColor(...SLATE_BG);
  doc.setDrawColor(...INPUT_BORDER);
  doc.setLineWidth(0.4);
  doc.roundedRect(x, inputY, width, inputH, 2, 2, 'FD');

  // Badge width calculation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  const badgeW = isDropdown ? 14 : doc.getTextWidth(badgeText) + 4.5;
  const badgeX = x + width - badgeW - 2.5;
  const badgeY = inputY + (inputH - 4.5) / 2;

  // Render Trailing Indicator Pill
  if (isDropdown) {
    doc.setFillColor(...GOLD_LIGHT);
    doc.setDrawColor(...GOLD_BORDER);
    doc.roundedRect(badgeX, badgeY, badgeW, 4.5, 1, 1, 'FD');
    doc.setTextColor(...GOLD);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('Select ▾', badgeX + badgeW / 2, badgeY + 3.2, { align: 'center' });
  } else {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(...INPUT_BORDER);
    doc.roundedRect(badgeX, badgeY, badgeW, 4.5, 1, 1, 'FD');
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.text(badgeText, badgeX + badgeW / 2, badgeY + 3.2, { align: 'center' });
  }

  // Instructional Text inside box (What user needs to type)
  doc.setFont(isMonospace ? 'courier' : 'helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105); // slate-600

  let displayVal = instructionText;
  const maxAvailableTextW = width - badgeW - 6.5;
  if (doc.getTextWidth(displayVal) > maxAvailableTextW) {
    while (doc.getTextWidth(displayVal + '...') > maxAvailableTextW && displayVal.length > 2) {
      displayVal = displayVal.slice(0, -1);
    }
    displayVal = displayVal + '...';
  }

  doc.text(displayVal, x + 3.5, inputY + inputH / 2 + 1.2);
}

// ============================================================================
// PAGE 1: PORTAL HERO, BUYER PERKS & 3 REQUIRED KYC DOCUMENTS
// ============================================================================
drawPageHeader(doc, 1);

let y = 28;

// "SALVAGE BUYER ONBOARDING PORTAL" Pill Badge (Identical to Website)
doc.setFillColor(...GOLD_LIGHT);
doc.setDrawColor(...GOLD_BORDER);
doc.roundedRect(pageWidth / 2 - 42, y, 84, 6.5, 3.25, 3.25, 'FD');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...GOLD);
doc.text('SALVAGE BUYER ONBOARDING PORTAL', pageWidth / 2, y + 4.5, { align: 'center' });

y += 9.5;

// Main Heading
doc.setFont('helvetica', 'bold');
doc.setFontSize(17);
doc.setTextColor(...DARK_SLATE);
doc.text('Buyer Account Registration Guide', pageWidth / 2, y, { align: 'center' });

y += 5;
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(...MUTED);
doc.text('Complete the 3-stage verification process to participate in live scrap tenders & salvage asset bidding.', pageWidth / 2, y, { align: 'center' });

y += 6.5;

// Stepper visual on Page 1 (shows Step 1 Active)
y = drawWebsiteStepper(doc, y, 1);

y += 6.5;

// "Why Register as a Buyer on SalvageReef?" Card
doc.setFillColor(...SLATE_BG);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, contentWidth, 40, 3, 3, 'FD');

// Header strip inside card
doc.setFillColor(...NAVY);
doc.roundedRect(margin, y, contentWidth, 7, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.8);
doc.setTextColor(...WHITE);
doc.text('WHY REGISTER ON SALVAGEREEF? (EXCLUSIVELY FOR BUYERS & BIDDERS)', margin + 6, y + 4.8);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(...BODY_TEXT);
const perks = [
  '• Direct Factory Tenders: Bid directly on dismantled plant machinery, manufacturing scrap, PE coils, and metal lots.',
  '• 100% Genuine Corporate Sellers: Every auction is verified by SalvageReef desk with official inspection PDFs & site visits.',
  '• Live Bidding Feed: Real-time price updates with transparent H1 (Highest Bidder) ranking visible during the auction.',
  '• 100% EMD Safety Guarantee: Full refund of your Earnest Money Deposit directly to your bank account if you do not win.',
];
let perkY = y + 13;
perks.forEach((p) => {
  drawSafeWrappedText(doc, p, margin + 6, perkY, contentWidth - 12, 4.5);
  perkY += 6.5;
});

y += 46;

// Section Header: Required Documents
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(...NAVY);
doc.text('3 Documents Required for Verification (Keep Ready on Your Phone / PC)', margin, y);

y += 4;
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.6);
doc.setTextColor(...MUTED);
doc.text('To ensure genuine commercial bidding and tax compliance, buyers upload these 3 proofs in Stage 2:', margin, y);

y += 5.5;

// 3 Dropzone-style cards explaining what the user needs to upload
const docCards = [
  {
    badge: 'IDENTITY PROOF',
    title: '1. PAN Card Proof *',
    sub: 'Business / Proprietor PAN',
    desc: 'Upload clear photo or PDF of your 10-digit PAN card. Required to verify buyer tax identity and TDS/TCS records.',
    buttonText: 'Click to Browse & Upload',
    fileNotice: 'JPG, PNG, PDF • Max 5MB',
  },
  {
    badge: 'BUSINESS PROOF',
    title: '2. GST Certificate *',
    sub: 'Form GST REG-06',
    desc: 'Upload official 15-digit GST Registration Certificate. Required to issue commercial scrap sale tax invoices.',
    buttonText: 'Click to Browse & Upload',
    fileNotice: 'Official REG-06 Document',
  },
  {
    badge: 'BANKING PROOF',
    title: '3. Cancelled Cheque *',
    sub: 'Passbook / Cheque Copy',
    desc: 'Upload cheque leaf with "CANCELLED" written across. Verifies bank account details for prompt 100% EMD refunds.',
    buttonText: 'Click to Browse & Upload',
    fileNotice: 'Name & IFSC Clearly Visible',
  },
];

const cardW = (contentWidth - 8) / 3;
const cardH = 62;

docCards.forEach((card, idx) => {
  const cardX = margin + idx * (cardW + 4);

  // White Box with border
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(cardX, y, cardW, cardH, 3, 3, 'FD');

  // Pill badge
  doc.setFillColor(...SLATE_BG);
  doc.roundedRect(cardX + 4, y + 4, cardW - 8, 4.8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...GOLD);
  doc.text(card.badge, cardX + cardW / 2, y + 7.4, { align: 'center' });

  // Title
  doc.setTextColor(...DARK_SLATE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.text(card.title, cardX + cardW / 2, y + 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(card.sub, cardX + cardW / 2, y + 19.5, { align: 'center' });

  // Description (Auto-Wrapped to card width - 8)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...BODY_TEXT);
  drawSafeWrappedText(doc, card.desc, cardX + 4, y + 25, cardW - 8, 3.8);

  // File Notice
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(...MUTED);
  doc.text(card.fileNotice, cardX + cardW / 2, y + cardH - 16, { align: 'center' });

  // Mock Upload Button
  doc.setFillColor(...SLATE_BG);
  doc.setDrawColor(...INPUT_BORDER);
  doc.roundedRect(cardX + 5, y + cardH - 11.5, cardW - 10, 7.5, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...DARK_SLATE);
  doc.text(card.buttonText, cardX + cardW / 2, y + cardH - 6.8, { align: 'center' });
});

y += cardH + 6;

// Emerald Pro-Tips Banner
doc.setFillColor(...EMERALD_BG);
doc.setDrawColor(...EMERALD_BORDER);
doc.roundedRect(margin, y, contentWidth, 27, 3, 3, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...EMERALD_DARK);
doc.text('✓ 3 Simple Tips for Instant 10-Minute Verification Approval:', margin + 6, y + 5.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(4, 120, 87);
const tips = [
  '1. Sharp Daylight Photos: Take clear photos with your smartphone camera. Numbers and names must be easily readable.',
  '2. Matching Details: The Firm Name entered in Stage 1 must match the legal trade name on your GST certificate.',
  '3. File Size Under 5 MB: Standard photos and scanned PDFs work smoothly. Documents auto-compress on upload.',
];
let tY = y + 11;
tips.forEach((t) => {
  drawSafeWrappedText(doc, t, margin + 6, tY, contentWidth - 12, 4.5);
  tY += 5;
});

// ============================================================================
// PAGE 2: STAGE 1 — BASIC & CONTACT DETAILS (INSTRUCTIONAL FORM BLUEPRINT)
// ============================================================================
doc.addPage();
drawPageHeader(doc, 2);

y = 28;

doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
doc.setTextColor(...NAVY);
doc.text('Stage 1 : Basic & Contact Details', margin, y);

y += 4.5;
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(...MUTED);
doc.text('Website URL: https://salvagereef.com/register  •  Mobile & Desktop Compatible', margin, y);

y += 6;

// Stepper showing Step 1 Active
y = drawWebsiteStepper(doc, y, 1);

y += 6;

// Country / Operating Region Selection Box (Exact replica from website)
doc.setFillColor(...GOLD_LIGHT);
doc.setDrawColor(...GOLD_BORDER);
doc.roundedRect(margin, y, contentWidth, 15, 2.5, 2.5, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.8);
doc.setTextColor(...NAVY);
doc.text('Country / Operating Region *', margin + 5, y + 5.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(...BODY_TEXT);
doc.text('Select your business country. Indian buyers select India (+91). Global buyers choose their country.', margin + 5, y + 10.8);

// Selector mockup on right
const cSelW = 75;
const cSelX = pageWidth - margin - cSelW - 4;
doc.setFillColor(...WHITE);
doc.setDrawColor(...GOLD);
doc.roundedRect(cSelX, y + 3, cSelW, 9, 2, 2, 'FD');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.2);
doc.setTextColor(...DARK_SLATE);
doc.text('Select Country: India (+91)', cSelX + 4, y + 9);
doc.setTextColor(...GOLD);
doc.text('▾', cSelX + cSelW - 6, y + 9);

y += 19;

// Section Banner
doc.setFillColor(...NAVY);
doc.roundedRect(margin, y, contentWidth, 6.5, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.8);
doc.setTextColor(...WHITE);
doc.text('STAGE 1 FIELDS : WHAT INFORMATION YOU NEED TO ENTER', margin + 6, y + 4.5);

y += 9.5;

// 10 Instructional Input Fields (What user needs to write / select)
const colW = (contentWidth - 6) / 2;
const col1X = margin;
const col2X = margin + colW + 6;
const fieldH = 13;

// Column 1 Fields with Clear Writing Instructions
const col1Fields = [
  {
    label: 'Vendor / Firm Name *',
    instruction: 'Type your registered company / firm name',
    badge: 'Legal Name',
  },
  {
    label: 'Entity Type *',
    instruction: 'Select: Proprietor, Partnership, or Pvt Ltd',
    opts: { isDropdown: true },
  },
  {
    label: 'PAN Number (10 characters) *',
    instruction: 'Enter 10-digit PAN (e.g. ABCDE1234F)',
    badge: '10 Digits',
    opts: { isMonospace: true },
  },
  {
    label: 'GST Number (15 characters) *',
    instruction: 'Enter 15-digit GSTIN (e.g. 27ABCDE1234F1Z5)',
    badge: '15 Digits',
    opts: { isMonospace: true },
  },
  {
    label: 'Registered Business Address *',
    instruction: 'Type complete office / factory address',
    badge: 'Address',
  },
];

let curY1 = y;
col1Fields.forEach((f) => {
  drawInputMockup(doc, col1X, curY1, colW, fieldH, f.label, f.instruction, {
    badgeText: f.badge,
    ...(f.opts || {}),
  });
  curY1 += fieldH + 3.5;
});

// Column 2 Fields with Clear Writing Instructions
const col2Fields = [
  {
    label: 'State & City (with Pincode) *',
    instruction: 'Enter State, City & 6-digit Pincode',
    badge: 'Location',
  },
  {
    label: 'SPOC / Contact Person Name *',
    instruction: 'Enter full name of primary bidder / manager',
    badge: 'Authorized',
  },
  {
    label: 'Mobile Number (10 digits) *',
    instruction: 'Enter 10-digit mobile number for OTP',
    badge: '+91 Mobile',
    opts: { isMonospace: true },
  },
  {
    label: 'Official Email ID *',
    instruction: 'Enter active email for tender updates',
    badge: 'Email ID',
  },
  {
    label: 'Create Account Password *',
    instruction: 'Create secure password (min 6 characters)',
    badge: 'Min 6 Chars',
  },
];

let curY2 = y;
col2Fields.forEach((f) => {
  drawInputMockup(doc, col2X, curY2, colW, fieldH, f.label, f.instruction, {
    badgeText: f.badge,
    ...(f.opts || {}),
  });
  curY2 += fieldH + 3.5;
});

y = Math.max(curY1, curY2) + 1.5;

// Mock "Next: Bank & Document Uploads" Button
doc.setFillColor(...GOLD);
doc.roundedRect(margin, y, contentWidth, 9.5, 2.5, 2.5, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.2);
doc.setTextColor(...WHITE);
doc.text('NEXT: BANK & DOCUMENT UPLOADS  →', pageWidth / 2, y + 6.2, { align: 'center' });

y += 14.5;

// Helpful Field Explanations Card (Plain English for Buyers) - Guaranteed Wrapping
doc.setFillColor(...SLATE_BG);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, contentWidth, 42, 3, 3, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.2);
doc.setTextColor(...NAVY);
doc.text('Helpful Field Notes for Buyers & Bidders:', margin + 6, y + 5.5);

const notes = [
  '• Firm Name: Enter the exact legal name of your business as registered on your GST certificate.',
  '• Entity Type: Choose whether your firm is a Proprietorship, Partnership, Private Limited, or LLP.',
  '• SPOC Person: Single Point of Contact — the primary authorized person who will place bids and receive lot updates.',
  '• Mobile & Email: You will receive lot winning notifications, inspection site passes, and delivery order alerts here.',
  '• Password: Must be at least 6 characters. You will use this password to log in and participate in live scrap bidding.',
];
let nY = y + 11;
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(...BODY_TEXT);
notes.forEach((note) => {
  drawSafeWrappedText(doc, note, margin + 6, nY, contentWidth - 12, 4.2);
  nY += 6;
});

// ============================================================================
// PAGE 3: STAGE 2 — BANK DETAILS & KYC UPLOADS (INSTRUCTIONAL FORM BLUEPRINT)
// ============================================================================
doc.addPage();
drawPageHeader(doc, 3);

y = 28;

doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
doc.setTextColor(...NAVY);
doc.text('Stage 2 : Bank Details & Document Uploads', margin, y);

y += 4.5;
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(...MUTED);
doc.text('Your bank details ensure prompt 100% EMD refunds and transparent commercial billing.', margin, y);

y += 6;

// Stepper showing Step 2 Active
y = drawWebsiteStepper(doc, y, 2);

y += 6;

// Banking Information Banner
doc.setFillColor(...NAVY);
doc.roundedRect(margin, y, contentWidth, 6.5, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.8);
doc.setTextColor(...WHITE);
doc.text('BANK ACCOUNT INFORMATION (FOR IDENTITY & 100% EMD REFUNDS)', margin + 6, y + 4.5);

y += 9.5;

// 3 Bank Inputs (What user needs to write)
const bankColW = (contentWidth - 8) / 3;
const bInputs = [
  {
    label: 'Bank Name *',
    instruction: 'Type bank name (e.g. HDFC, SBI, ICICI)',
    badge: 'Bank Name',
  },
  {
    label: 'Account Number *',
    instruction: 'Type Account Number (9 to 18 digits)',
    badge: 'Current / Business',
    opts: { isMonospace: true },
  },
  {
    label: 'IFSC Code (11 digits) *',
    instruction: 'Type 11-digit IFSC (e.g. HDFC0001234)',
    badge: '11 Digits',
    opts: { isMonospace: true },
  },
];

bInputs.forEach((b, idx) => {
  const bX = margin + idx * (bankColW + 4);
  drawInputMockup(doc, bX, y, bankColW, 13, b.label, b.instruction, {
    badgeText: b.badge,
    ...(b.opts || {}),
  });
});

y += 17;

// Section Banner: Upload Verification Documents
doc.setFillColor(...GOLD);
doc.roundedRect(margin, y, contentWidth, 6.5, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.8);
doc.setTextColor(...WHITE);
doc.text('UPLOAD VERIFICATION DOCUMENTS (ATTACH YOUR 3 BUSINESS PROOFS)', margin + 6, y + 4.5);

y += 9.5;

// 3 Instructional Upload Cards (Explaining what document to attach)
const uploadInstructions = [
  {
    title: '1. PAN Card Proof *',
    sub: 'Business / Proprietor PAN',
    instruction: 'Attach scanned copy or clear photo of PAN Card.',
    tip: 'Must clearly show Name, PAN Number & Date of Birth/Inc.',
    buttonText: '📁 Click to Upload PAN',
  },
  {
    title: '2. GST Certificate *',
    sub: 'Form GST REG-06',
    instruction: 'Attach official 3-page GST REG-06 Certificate.',
    tip: 'Must show Trade Name & 15-digit GSTIN.',
    buttonText: '📁 Click to Upload GST',
  },
  {
    title: '3. Cancelled Cheque *',
    sub: 'Or Passbook Front Page',
    instruction: 'Attach Cheque with "CANCELLED" written across.',
    tip: 'Must clearly show Account Name, Number & IFSC Code.',
    buttonText: '📁 Click to Upload Cheque',
  },
];

const upCardW = (contentWidth - 8) / 3;
const upCardH = 44;

uploadInstructions.forEach((u, idx) => {
  const uX = margin + idx * (upCardW + 4);

  // Card box
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(uX, y, upCardW, upCardH, 2.5, 2.5, 'FD');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(...DARK_SLATE);
  doc.text(u.title, uX + upCardW / 2, y + 6.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...MUTED);
  doc.text(u.sub, uX + upCardW / 2, y + 10.8, { align: 'center' });

  // Instruction Box inside card
  doc.setFillColor(...SLATE_BG);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(uX + 3.5, y + 14, upCardW - 7, 13.5, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...DARK_SLATE);
  drawSafeWrappedText(doc, u.instruction, uX + 5, y + 18, upCardW - 10, 3.4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(...MUTED);
  drawSafeWrappedText(doc, u.tip, uX + 5, y + 23.5, upCardW - 10, 3);

  // Upload action button on bottom
  doc.setFillColor(...GOLD_LIGHT);
  doc.setDrawColor(...GOLD_BORDER);
  doc.roundedRect(uX + 5, y + upCardH - 9.5, upCardW - 10, 6, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...GOLD);
  doc.text(u.buttonText, uX + upCardW / 2, y + upCardH - 5.5, { align: 'center' });
});

y += upCardH + 5.5;

// Auto-Compression Feature Notice Box
doc.setFillColor(...EMERALD_BG);
doc.setDrawColor(...EMERALD_BORDER);
doc.roundedRect(margin, y, contentWidth, 19, 2.5, 2.5, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...EMERALD_DARK);
doc.text('✓ Auto-Optimized Upload Engine (Zero Timeout Errors):', margin + 6, y + 5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(4, 120, 87);
doc.text('Your documents are automatically compressed on your smartphone or browser before sending.', margin + 6, y + 9.5);
doc.text('Uploads complete in less than 2 seconds, even on regular 3G / 4G connections.', margin + 6, y + 14);

y += 23;

// Mock Step Navigation Buttons
const prevBtnW = 45;
const nextBtnW = contentWidth - prevBtnW - 4;

// Previous Button
doc.setFillColor(241, 245, 249);
doc.setDrawColor(...INPUT_BORDER);
doc.roundedRect(margin, y, prevBtnW, 9.5, 2, 2, 'FD');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.8);
doc.setTextColor(...BODY_TEXT);
doc.text('←  PREVIOUS', margin + prevBtnW / 2, y + 6.2, { align: 'center' });

// Next Button
doc.setFillColor(...GOLD);
doc.roundedRect(margin + prevBtnW + 4, y, nextBtnW, 9.5, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.2);
doc.setTextColor(...WHITE);
doc.text('NEXT: TERMS & REVIEW  →', margin + prevBtnW + 4 + nextBtnW / 2, y + 6.2, { align: 'center' });

y += 14.5;

// Why Bank Details are Required Box (Auto-Wrapped bullets)
doc.setFillColor(...SLATE_BG);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, contentWidth, 36, 3, 3, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.2);
doc.setTextColor(...NAVY);
doc.text('Why Are Bank Details Required for Buyers?', margin + 6, y + 5.5);

const bankFaqs = [
  '• 100% EMD Refund Guarantee: If you participate in an auction but are outbid (not H1), your full EMD is returned to this account.',
  '• Bank Account Matching: The bank account name should match your business entity or proprietor name.',
  '• Secure Data: SalvageReef uses encrypted bank storage strictly for verified bidder payments and refunds.',
];
let bqY = y + 11;
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(...BODY_TEXT);
bankFaqs.forEach((bf) => {
  drawSafeWrappedText(doc, bf, margin + 6, bqY, contentWidth - 12, 4.2);
  bqY += 7.5;
});

// ============================================================================
// PAGE 4: STAGE 3 — REVIEW SUMMARY, APPROVAL & HOW TO BID ON AUCTIONS
// ============================================================================
doc.addPage();
drawPageHeader(doc, 4);

y = 28;

doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
doc.setTextColor(...NAVY);
doc.text('Stage 3 : Review Summary & What Happens Next', margin, y);

y += 4.5;
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(...MUTED);
doc.text('Verify your details, accept bidding terms, and submit for instant admin verification.', margin, y);

y += 6;

// Stepper showing Step 3 Complete
y = drawWebsiteStepper(doc, y, 3);

y += 6;

// STAGE 3: INSTRUCTIONAL REVIEW SUMMARY CARD (Explaining what appears in each box)
doc.setFillColor(...SLATE_BG);
doc.setDrawColor(...BORDER);
doc.roundedRect(margin, y, contentWidth, 50, 3, 3, 'FD');

// Header inside card
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.2);
doc.setTextColor(...DARK_SLATE);
doc.text('STAGE 3 REVIEW SUMMARY : WHAT YOUR APPLICATION WILL DISPLAY', margin + 6, y + 5.5);

// Summary Grid (3 columns x 3 rows with multi-line support)
const gridStartY = y + 11;
const colGridW = (contentWidth - 12) / 3;

const summaryItems = [
  { label: 'VENDOR NAME', line1: 'Your Business Legal Name', line2: '(As registered on GST certificate)', bold: true },
  { label: 'ENTITY TYPE', line1: 'Selected Constitution', line2: '(Proprietor / Partnership / Pvt Ltd)', bold: true },
  { label: 'GST NUMBER', line1: 'Your 15-Digit GSTIN', line2: '(Verified for tax invoicing)', bold: true, color: GOLD },

  { label: 'PAN NUMBER', line1: 'Your 10-Character PAN', line2: '(Tax verification identity)', bold: true },
  { label: 'SPOC / CONTACT', line1: 'Authorized Bidder Name', line2: '(Primary decision-making manager)', bold: true },
  { label: 'MOBILE & EMAIL', line1: 'Your 10-Digit Mobile', line2: '& Registered Official Email', bold: false },

  { label: 'BANK NAME', line1: 'Your Bank Name', line2: '(For 100% EMD refunds if outbid)', bold: true },
  { label: 'ACCOUNT & IFSC', line1: 'Your Account Number', line2: '& 11-digit Branch IFSC Code', bold: false },
  { label: 'LOCATION', line1: 'Your Business City & State', line2: 'with 6-Digit Postal PIN', bold: false },
];

summaryItems.forEach((item, i) => {
  const colIndex = i % 3;
  const rowIndex = Math.floor(i / 3);
  const cellX = margin + 6 + colIndex * colGridW;
  const cellY = gridStartY + rowIndex * 9.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(...MUTED);
  doc.text(item.label, cellX, cellY);

  doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
  doc.setFontSize(7.2);
  if (item.color) {
    doc.setTextColor(...item.color);
  } else {
    doc.setTextColor(...DARK_SLATE);
  }
  doc.text(item.line1, cellX, cellY + 3.6);

  if (item.line2) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(...MUTED);
    doc.text(item.line2, cellX, cellY + 7);
  }
});

// Badges Row for attached proofs
const badgeRowY = gridStartY + 30;
doc.setFont('helvetica', 'bold');
doc.setFontSize(6.2);
doc.setTextColor(...MUTED);
doc.text('VERIFICATION PROOFS ATTACHED IN YOUR APPLICATION:', margin + 6, badgeRowY - 1);

const proofs = ['✓ PAN Card Attached', '✓ GST Cert Attached', '✓ Cheque Attached'];
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

y += 54;

// Terms Checkbox & Registration Button Layout (Isolated columns to prevent collision)
doc.setFillColor(...GOLD_LIGHT);
doc.setDrawColor(...GOLD_BORDER);
doc.roundedRect(margin, y, contentWidth, 27, 2.5, 2.5, 'FD');

const termsTextW = contentWidth - 68; // Reserve 68mm on right for the button

// Checkbox square
doc.setFillColor(...GOLD);
doc.roundedRect(margin + 5, y + 4.5, 4.2, 4.2, 1, 1, 'F');
doc.setTextColor(...WHITE);
doc.setFont('helvetica', 'bold');
doc.setFontSize(6.8);
doc.text('✓', margin + 7.1, y + 7.6, { align: 'center' });

doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...DARK_SLATE);
doc.text('Accept Terms & Conditions * (Click Checkbox to Accept)', margin + 11.5, y + 7.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(...BODY_TEXT);
const termsNotice1 = 'I declare that all business vendor information, GSTIN, and Bank details provided above are authentic and genuine.';
const termsNotice2 = 'I agree to abide by SalvageReef Tender Bidding Rules, 100% EMD refund policies, and General Conditions of Sale.';
drawSafeWrappedText(doc, termsNotice1, margin + 11.5, y + 12, termsTextW, 3.8);
drawSafeWrappedText(doc, termsNotice2, margin + 11.5, y + 19, termsTextW, 3.8);

// Complete Registration Button on Right (Zero text collision)
const regBtnW = 58;
const regBtnX = pageWidth - margin - regBtnW - 4;
doc.setFillColor(...GOLD);
doc.roundedRect(regBtnX, y + 6.5, regBtnW, 14, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...WHITE);
doc.text('COMPLETE REGISTRATION  →', regBtnX + regBtnW / 2, y + 15, { align: 'center' });

y += 31;

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
doc.text('✓', margin + 10, y + 15, { align: 'center' });

doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(22, 101, 52);
doc.text('Registration Submitted for Admin Approval!', margin + 19, y + 7.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(21, 128, 61);
doc.text('Your vendor registration and submitted KYC documents have been received.', margin + 19, y + 12.5);
doc.text('The SalvageReef desk reviews your application within 2 to 4 business hours.', margin + 19, y + 16.5);
doc.text('Once approved, your account is activated and you will receive your unique Login ID (e.g. SR-XXXXXX).', margin + 19, y + 20.5);

y += 29;

// 4-Step Action Roadmap for Buyers (Refined descriptions that fit comfortably in 28mm)
const steps4 = [
  { step: '1', title: 'Sign In to Portal', desc: 'Login at salvagereef.com/login with your registered ID & password.' },
  { step: '2', title: 'Browse Tenders', desc: 'Review lot catalogs, site photos & download inspection PDF dossiers.' },
  { step: '3', title: 'Deposit Lot EMD', desc: 'Pay refundable EMD for desired lots to unlock live bidding.' },
  { step: '4', title: 'Bid & Win', desc: 'Place bids in live feed. Highest bid at close (H1) wins material!' },
];

const stW = (contentWidth - 9) / 4;
const stH = 27;

steps4.forEach((st, idx) => {
  const stX = margin + idx * (stW + 3);
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(stX, y, stW, stH, 2, 2, 'FD');

  doc.setFillColor(...NAVY);
  doc.roundedRect(stX + 3, y + 3, 14, 4.2, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(...WHITE);
  doc.text(`STEP ${st.step}`, stX + 10, y + 6, { align: 'center' });

  doc.setTextColor(...DARK_SLATE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text(st.title, stX + 3, y + 11.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);
  doc.setTextColor(...BODY_TEXT);
  drawSafeWrappedText(doc, st.desc, stX + 3, y + 15.5, stW - 6, 3.5);
});

y += stH + 4.5;

// Dedicated Support Card (Clean formatting, no emoji glyph glitches)
doc.setFillColor(...NAVY);
doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

doc.setTextColor(...WHITE);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.8);
doc.text('Have Questions? Dedicated Buyer Desk Support', margin + 7, y + 6);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(203, 213, 225);
doc.text('Our executive desk is available to assist you with registration, KYC documents & bidding.', margin + 7, y + 10.8);

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.8);
doc.setTextColor(...GOLD);
doc.text('Helpline / WhatsApp: +91 7304481166', margin + 7, y + 16.5);
doc.text('Email: salvagereef@gmail.com', margin + 92, y + 16.5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7);
doc.setTextColor(...WHITE);
doc.text('Website: salvagereef.com/register', margin + 7, y + 20.8);
doc.text('Desk: Mumbai / Thane, Maharashtra', margin + 92, y + 20.8);

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
