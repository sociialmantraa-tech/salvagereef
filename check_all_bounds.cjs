const { jsPDF } = require('./frontend/node_modules/jspdf');

const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
const pageWidth = 210;
const pageHeight = 297;
const margin = 14;
const contentWidth = 182;

console.log('--- Checking all element bounds & button clearances ---');

// P1 Buttons:
const cardW = (contentWidth - 8) / 3; // 58mm
const btnW = cardW - 8; // 50mm
doc.setFont('helvetica', 'bold');
doc.setFontSize(6.8);
['Browse & Upload PAN', 'Browse & Upload GST', 'Browse & Upload Cheque'].forEach(t => {
  const w = doc.getTextWidth(t);
  console.log(`P1 Upload btn "${t}": width=${w.toFixed(1)} in box ${btnW}mm -> left/right margin = ${((btnW - w)/2).toFixed(1)}mm`);
});

// P2 10 fields:
const colW = (contentWidth - 6) / 2; // 88mm
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
const p2Fields = [
  'Type your registered company / firm name',
  'Select: Proprietor, Partnership, or Pvt Ltd',
  'Enter 10-digit PAN (e.g. ABCDE1234F)',
  'Enter 15-digit GSTIN (e.g. 27ABCDE1234F1Z5)',
  'Type complete office / factory address',
  'Enter State, City & 6-digit Pincode',
  'Enter full name of primary bidder / manager',
  'Enter 10-digit mobile number for OTP',
  'Enter active email for tender updates',
  'Create secure password (min 6 characters)',
];
p2Fields.forEach(t => {
  const w = doc.getTextWidth(t);
  console.log(`P2 input "${t.substring(0, 25)}...": width=${w.toFixed(1)} in box 88mm -> margin=${(88 - w).toFixed(1)}mm`);
});

// P3 3 Bank inputs:
const bankColW = (contentWidth - 8) / 3; // 58mm
const p3Bank = [
  'Type bank name (e.g. HDFC, SBI, ICICI)',
  'Type Account Number (9 to 18 digits)',
  'Type 11-digit IFSC (e.g. HDFC0001234)',
];
p3Bank.forEach(t => {
  const w = doc.getTextWidth(t);
  console.log(`P3 bank "${t}": width=${w.toFixed(1)} in box ${bankColW}mm -> margin=${(bankColW - w).toFixed(1)}mm`);
});

// P3 3 Upload cards & buttons:
const upCardW = (contentWidth - 8) / 3; // 58mm
const upBtnW = upCardW - 8; // 50mm
['Browse & Upload PAN', 'Browse & Upload GST', 'Browse & Upload Cheque'].forEach(t => {
  const w = doc.getTextWidth(t);
  console.log(`P3 Upload btn "${t}": width=${w.toFixed(1)} in box ${upBtnW}mm -> margin=${((upBtnW - w)/2).toFixed(1)}mm`);
});

// P4 Terms & Hero Button:
doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
const t1 = doc.splitTextToSize('1. I declare that all business vendor information, GSTIN, and Bank details provided above are authentic and genuine.', contentWidth - 16);
const t2 = doc.splitTextToSize('2. I agree to abide by SalvageReef Tender Bidding Rules, 100% EMD refund policies, and General Conditions of Sale.', contentWidth - 16);
console.log('P4 Terms line 1 lines:', t1.length, 'line 2 lines:', t2.length);

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
const heroBtnW = doc.getTextWidth('COMPLETE BUYER REGISTRATION  ->');
console.log(`P4 Hero button text width: ${heroBtnW.toFixed(1)}mm in box ${contentWidth}mm -> left/right margin = ${((contentWidth - heroBtnW)/2).toFixed(1)}mm`);
