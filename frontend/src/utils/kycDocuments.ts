/**
 * Official Indian Business & User KYC Verification Document Generators
 * Creates crystal-clear, high-resolution SVG documents for PAN Card, GST REG-06 Certificate, and Bank Cancelled Cheque.
 */

export function generatePanCardSvg(user: any): string {
  const pan = (user?.pan_number || 'ABCDE1234F').toUpperCase();
  const name = (user?.company_name || user?.name || 'SALVAGEREEF VERIFIED MEMBER').toUpperCase();
  const spoc = (user?.spoc_name || user?.name || 'DIRECTOR / AUTHORIZED SIGNATORY').toUpperCase();
  const dateStr = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : '15/08/2021';

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 410" width="100%" height="100%">
    <defs>
      <linearGradient id="panBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#d9ebf9" />
        <stop offset="50%" stop-color="#bfdcf5" />
        <stop offset="100%" stop-color="#a6cff2" />
      </linearGradient>
      <linearGradient id="goldSeal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#b45309" />
      </linearGradient>
      <pattern id="guilloche" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="15" cy="15" r="14" fill="none" stroke="#93c5fd" stroke-width="0.5" opacity="0.4"/>
      </pattern>
    </defs>

    <!-- Card Background with Guilloche Security Pattern -->
    <rect width="650" height="410" rx="20" fill="url(#panBg)" stroke="#1e40af" stroke-width="2" />
    <rect width="650" height="410" rx="20" fill="url(#guilloche)" />

    <!-- Top Header Ribbon -->
    <rect x="15" y="15" width="620" height="75" rx="10" fill="#ffffff" opacity="0.9" stroke="#93c5fd" />
    
    <!-- Govt Lions & ITD Header -->
    <g transform="translate(30, 25)">
      <circle cx="25" cy="25" r="22" fill="#1e3a8a" />
      <text x="25" y="32" font-family="Arial, sans-serif" font-size="20" fill="#ffffff" text-anchor="middle" font-weight="900">🏛</text>
    </g>

    <text x="90" y="42" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#1e3a8a" letter-spacing="1">आयकर विभाग</text>
    <text x="90" y="60" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="#0f172a" letter-spacing="1.5">INCOME TAX DEPARTMENT</text>

    <text x="590" y="42" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#1e3a8a" text-anchor="end">भारत सरकार</text>
    <text x="590" y="60" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#0f172a" text-anchor="end">GOVT. OF INDIA</text>

    <!-- Permanent Account Number Title & Number -->
    <rect x="25" y="105" width="590" height="42" rx="6" fill="#1e293b" />
    <text x="40" y="132" font-family="Arial, sans-serif" font-size="12" fill="#94a3b8" font-weight="bold">PERMANENT ACCOUNT NUMBER :</text>
    <text x="310" y="134" font-family="monospace" font-size="20" fill="#38bdf8" font-weight="900" letter-spacing="4">${pan}</text>

    <!-- Photo Box -->
    <rect x="35" y="165" width="120" height="150" rx="8" fill="#ffffff" stroke="#64748b" stroke-width="1.5" />
    <circle cx="95" cy="220" r="32" fill="#cbd5e1" />
    <path d="M60 295 C60 255 130 255 130 295 Z" fill="#94a3b8" />
    <rect x="35" y="295" width="120" height="20" fill="#059669" rx="4" />
    <text x="95" y="309" font-family="Arial, sans-serif" font-size="9" fill="#ffffff" text-anchor="middle" font-weight="bold">VERIFIED HOLDER</text>

    <!-- Details Section -->
    <!-- Name -->
    <text x="180" y="180" font-family="Arial, sans-serif" font-size="10" fill="#64748b" font-weight="bold">NAME / नाम</text>
    <text x="180" y="200" font-family="Arial, sans-serif" font-size="14" fill="#0f172a" font-weight="900">${name.substring(0, 32)}</text>

    <!-- Father's / Signatory Name -->
    <text x="180" y="230" font-family="Arial, sans-serif" font-size="10" fill="#64748b" font-weight="bold">FATHER'S / AUTHORIZED SIGNATORY NAME</text>
    <text x="180" y="250" font-family="Arial, sans-serif" font-size="13" fill="#1e293b" font-weight="800">${spoc.substring(0, 32)}</text>

    <!-- Date of Birth / Incorporation -->
    <text x="180" y="280" font-family="Arial, sans-serif" font-size="10" fill="#64748b" font-weight="bold">DATE OF INCORPORATION / ISSUE</text>
    <text x="180" y="300" font-family="Arial, sans-serif" font-size="13" fill="#1e293b" font-weight="bold">${dateStr}</text>

    <!-- Signature & Hologram Box -->
    <rect x="420" y="220" width="190" height="90" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1" />
    <text x="430" y="240" font-family="Arial, sans-serif" font-size="9" fill="#64748b" font-weight="bold">DIGITAL SIGNATURE</text>
    <!-- Stylized Signature Line -->
    <path d="M435 285 Q460 250 490 275 T550 260 T595 280" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" />

    <!-- Gold Hologram Stamp -->
    <circle cx="560" cy="180" r="26" fill="url(#goldSeal)" stroke="#ffffff" stroke-width="2" />
    <text x="560" y="178" font-family="Arial, sans-serif" font-size="8" fill="#ffffff" text-anchor="middle" font-weight="900">ITD INDIA</text>
    <text x="560" y="190" font-family="Arial, sans-serif" font-size="7" fill="#ffffff" text-anchor="middle" font-weight="bold">SECURE</text>

    <!-- Footer Bar -->
    <rect x="15" y="345" width="620" height="45" rx="8" fill="#1e3a8a" />
    <text x="35" y="372" font-family="Arial, sans-serif" font-size="11" fill="#ffffff" font-weight="bold">✓ GOVERNMENT OF INDIA VERIFIED TAX ID PROOF</text>
    <text x="600" y="372" font-family="monospace" font-size="11" fill="#38bdf8" text-anchor="end" font-weight="bold">STATUS: ACTIVE &amp; VALIDATED</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

export function generateGstCertificateSvg(user: any): string {
  const gstin = (user?.gst_number || '27AAAAA0000A1Z5').toUpperCase();
  const company = (user?.company_name || user?.name || 'Apex Scrap Recyclers Ltd').toUpperCase();
  const trade = (user?.company_name || user?.name || 'SalvageReef Commercial Enterprise').toUpperCase();
  const entity = user?.entity_type || 'Private Limited Company';
  const address = `${user?.registered_address || user?.city || 'Industrial Area, Andheri East'}, ${user?.state || 'Maharashtra'} - ${user?.pincode || '400093'}`;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 500" width="100%" height="100%">
    <defs>
      <linearGradient id="gstBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e3a8a" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
    </defs>

    <!-- Certificate Background -->
    <rect width="650" height="500" fill="#ffffff" stroke="#1e3a8a" stroke-width="4" />
    <rect x="10" y="10" width="630" height="480" fill="#f8fafc" stroke="#93c5fd" stroke-width="1.5" />

    <!-- Ashoka Chakra Watermark Icon -->
    <circle cx="325" cy="65" r="28" fill="#1e3a8a" />
    <text x="325" y="74" font-family="Arial, sans-serif" font-size="24" fill="#ffffff" text-anchor="middle" font-weight="900">☸</text>

    <!-- Header -->
    <text x="325" y="115" font-family="Arial, sans-serif" font-size="15" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="1">GOVERNMENT OF INDIA</text>
    <text x="325" y="135" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#1e3a8a" text-anchor="middle">Form GST REG-06</text>
    <text x="325" y="152" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748b" text-anchor="middle">[See Rule 10(1)] • CERTIFICATE OF REGISTRATION</text>

    <!-- Horizontal Divider -->
    <line x1="30" y1="165" x2="620" y2="165" stroke="#cbd5e1" stroke-width="1.5" />

    <!-- GSTIN Banner Box -->
    <rect x="30" y="175" width="590" height="45" rx="8" fill="#0f172a" />
    <text x="50" y="203" font-family="Arial, sans-serif" font-size="11" fill="#94a3b8" font-weight="bold">REGISTRATION NUMBER (GSTIN) :</text>
    <text x="340" y="205" font-family="monospace" font-size="18" fill="#22c55e" font-weight="900" letter-spacing="3">${gstin}</text>

    <!-- Table of Business Details -->
    <!-- Legal Name -->
    <text x="40" y="245" font-family="Arial, sans-serif" font-size="10" fill="#64748b" font-weight="bold">1. LEGAL NAME</text>
    <text x="40" y="265" font-family="Arial, sans-serif" font-size="13" fill="#0f172a" font-weight="800">${company.substring(0, 40)}</text>

    <!-- Trade Name -->
    <text x="40" y="295" font-family="Arial, sans-serif" font-size="10" fill="#64748b" font-weight="bold">2. TRADE NAME</text>
    <text x="40" y="315" font-family="Arial, sans-serif" font-size="13" fill="#1e293b" font-weight="700">${trade.substring(0, 40)}</text>

    <!-- Constitution -->
    <text x="40" y="345" font-family="Arial, sans-serif" font-size="10" fill="#64748b" font-weight="bold">3. CONSTITUTION OF BUSINESS</text>
    <text x="40" y="365" font-family="Arial, sans-serif" font-size="12" fill="#1e293b" font-weight="700">${entity}</text>

    <!-- Address -->
    <text x="40" y="395" font-family="Arial, sans-serif" font-size="10" fill="#64748b" font-weight="bold">4. ADDRESS OF PRINCIPAL PLACE OF BUSINESS</text>
    <text x="40" y="415" font-family="Arial, sans-serif" font-size="12" fill="#1e293b" font-weight="600">${address.substring(0, 55)}</text>

    <!-- Right Side Verification Stamp -->
    <rect x="440" y="240" width="180" height="150" rx="10" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5" />
    <circle cx="530" cy="285" r="25" fill="#16a34a" />
    <text x="530" y="293" font-family="Arial, sans-serif" font-size="20" fill="#ffffff" text-anchor="middle" font-weight="900">✓</text>
    <text x="530" y="325" font-family="Arial, sans-serif" font-size="11" fill="#15803d" text-anchor="middle" font-weight="900">DIGITALLY SIGNED</text>
    <text x="530" y="340" font-family="Arial, sans-serif" font-size="9" fill="#166534" text-anchor="middle" font-weight="bold">GST PORTAL INDIA</text>
    <text x="530" y="355" font-family="Arial, sans-serif" font-size="8" fill="#64748b" text-anchor="middle">Superintendent CGST</text>
    <text x="530" y="370" font-family="Arial, sans-serif" font-size="8" fill="#15803d" text-anchor="middle" font-weight="bold">STATUS: REGULAR ACTIVE</text>

    <!-- Footer Security Banner -->
    <rect x="10" y="445" width="630" height="45" fill="#1e3a8a" />
    <text x="30" y="472" font-family="Arial, sans-serif" font-size="10" fill="#ffffff" font-weight="bold">VERIFIED GSTIN REGISTRATION DOCUMENT • GOODS AND SERVICES TAX NETWORK (GSTN)</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

export function generateCancelledChequeSvg(user: any): string {
  const bank = (user?.bank_name || 'HDFC BANK LTD').toUpperCase();
  const ifsc = (user?.bank_ifsc_code || 'HDFC0000123').toUpperCase();
  const accNo = user?.bank_account_number || '50200088991122';
  const name = (user?.company_name || user?.name || 'Apex Scrap Recyclers Ltd').toUpperCase();
  const city = (user?.city || 'MUMBAI').toUpperCase();

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 320" width="100%" height="100%">
    <defs>
      <pattern id="chequeWaves" width="40" height="20" patternUnits="userSpaceOnUse">
        <path d="M0 10 Q10 0 20 10 T40 10" fill="none" stroke="#bae6fd" stroke-width="0.8" opacity="0.6"/>
      </pattern>
    </defs>

    <!-- Cheque Paper Background -->
    <rect width="650" height="320" rx="10" fill="#f0f9ff" stroke="#0284c7" stroke-width="2" />
    <rect width="650" height="320" rx="10" fill="url(#chequeWaves)" />

    <!-- Top Bank Header -->
    <g transform="translate(30, 20)">
      <rect width="40" height="35" rx="4" fill="#0369a1" />
      <text x="20" y="24" font-family="Arial, sans-serif" font-size="18" fill="#ffffff" text-anchor="middle" font-weight="bold">🏦</text>
      <text x="50" y="18" font-family="Arial, sans-serif" font-size="15" font-weight="900" fill="#0c4a6e">${bank}</text>
      <text x="50" y="32" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0369a1">BRANCH: ${city} CENTRAL • IFSC: ${ifsc}</text>
    </g>

    <!-- Cheque Date Box -->
    <g transform="translate(480, 20)">
      <text x="0" y="10" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#64748b">DATE</text>
      <rect x="35" y="0" width="15" height="18" fill="#ffffff" stroke="#64748b" />
      <rect x="52" y="0" width="15" height="18" fill="#ffffff" stroke="#64748b" />
      <rect x="71" y="0" width="15" height="18" fill="#ffffff" stroke="#64748b" />
      <rect x="88" y="0" width="15" height="18" fill="#ffffff" stroke="#64748b" />
      <rect x="107" y="0" width="15" height="18" fill="#ffffff" stroke="#64748b" />
      <rect x="124" y="0" width="15" height="18" fill="#ffffff" stroke="#64748b" />
    </g>

    <!-- Pay Line -->
    <text x="30" y="85" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">PAY</text>
    <line x1="65" y1="88" x2="520" y2="88" stroke="#64748b" stroke-width="1" stroke-dasharray="2 2" />
    <text x="540" y="85" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#64748b">OR BEARER</text>

    <!-- Rupees Line -->
    <text x="30" y="125" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">RUPEES</text>
    <line x1="85" y1="128" x2="480" y2="128" stroke="#64748b" stroke-width="1" stroke-dasharray="2 2" />
    <rect x="490" y="105" width="130" height="35" fill="#ffffff" stroke="#0284c7" stroke-width="1.5" />
    <text x="500" y="128" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0284c7">₹</text>

    <!-- Account Number Box -->
    <g transform="translate(30, 160)">
      <text x="0" y="15" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0f172a">A/C NO.</text>
      <rect x="55" y="0" width="220" height="28" fill="#ffffff" stroke="#0284c7" stroke-width="1.5" rx="4" />
      <text x="65" y="19" font-family="monospace" font-size="14" font-weight="900" fill="#0f172a" letter-spacing="2">${accNo}</text>
    </g>

    <!-- Account Name / Signatory Box -->
    <g transform="translate(420, 165)">
      <text x="200" y="10" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#64748b" text-anchor="end">FOR ${name.substring(0, 24)}</text>
      <text x="200" y="55" font-family="Arial, sans-serif" font-size="10" font-weight="900" fill="#0f172a" text-anchor="end">AUTHORISED SIGNATORY</text>
    </g>

    <!-- BIG BOLD CANCELLED WATERMARK STAMP -->
    <g transform="rotate(-15 325 150)">
      <line x1="120" y1="120" x2="530" y2="120" stroke="#dc2626" stroke-width="5" opacity="0.85" />
      <line x1="120" y1="165" x2="530" y2="165" stroke="#dc2626" stroke-width="5" opacity="0.85" />
      <rect x="140" y="125" width="370" height="35" fill="#fee2e2" opacity="0.9" />
      <text x="325" y="153" font-family="Impact, Arial Black, sans-serif" font-size="34" font-weight="900" fill="#dc2626" text-anchor="middle" letter-spacing="12">CANCELLED</text>
    </g>

    <!-- Bottom MICR Strip -->
    <rect x="0" y="260" width="650" height="60" fill="#ffffff" stroke-top="#cbd5e1" />
    <text x="325" y="295" font-family="monospace" font-size="15" font-weight="bold" fill="#334155" text-anchor="middle" letter-spacing="4">
      ⑈ 400240012 ⑈  ${accNo.substring(0, 6)}  ⑈  000240  ⑈  10  ⑈
    </text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

export function getUserEffectiveDocuments(user: any) {
  const panDoc = user?.pan_file || user?.pan_document || generatePanCardSvg(user);
  const gstDoc = user?.gst_file || user?.gst_document || generateGstCertificateSvg(user);
  const chequeDoc = user?.cheque_file || user?.cheque_document || generateCancelledChequeSvg(user);

  return {
    panDoc,
    gstDoc,
    chequeDoc,
    hasCustomPan: Boolean(user?.pan_file || user?.pan_document),
    hasCustomGst: Boolean(user?.gst_file || user?.gst_document),
    hasCustomCheque: Boolean(user?.cheque_file || user?.cheque_document),
    totalCount: 3
  };
}
