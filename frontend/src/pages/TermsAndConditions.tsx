import React, { useState } from 'react';
import LegalHeaderNav from '../components/LegalHeaderNav';
import { 
  Scale, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  FileText, 
  Gavel, 
  Printer, 
  ChevronRight,
  Info,
  HelpCircle
} from 'lucide-react';

export default function TermsAndConditions() {
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      id: 'clause-1',
      number: '1',
      title: 'User Registration',
      content: [
        '1.1 Every user registering on the website shall provide accurate, complete, and up-to-date information about themselves or their business.',
        '1.2 Users are solely responsible for maintaining the confidentiality of their login credentials and all activities carried out through their accounts.',
        '1.3 SalvageReef reserves the right to suspend, terminate, blacklist, or reject any registration or account without assigning any reason.'
      ]
    },
    {
      id: 'clause-2',
      number: '2',
      title: 'Nature of Services',
      content: [
        '2.1 SalvageReef is an online marketplace and auction platform that facilitates the buying and selling of scrap, salvage, surplus, damaged, obsolete, used, or unsecured materials.',
        '2.2 SalvageReef acts only as a facilitator between buyers and sellers and is not a buyer, seller, owner, agent, or custodian of the listed materials unless specifically stated.',
        '2.3 SalvageReef does not guarantee successful completion of any transaction between users.'
      ]
    },
    {
      id: 'clause-3',
      number: '3',
      title: 'Product Information',
      content: [
        '3.1 All information, descriptions, specifications, photographs, quantities, and documentation displayed on the website are provided by the seller.',
        '3.2 SalvageReef does not verify or warrant the accuracy, completeness, authenticity, or legality of any listing.',
        '3.3 Buyers must independently inspect and verify the material before placing bids or making purchases.'
      ]
    },
    {
      id: 'clause-4',
      number: '4',
      title: 'Sale Basis',
      highlightBox: true,
      content: [
        'Unless specifically mentioned otherwise, every lot or material listed on SalvageReef shall be sold strictly on:',
        '• “As Is Where Is” Basis',
        '• “Whatever There Is” Basis',
        '• “No Complaint” Basis',
        '• “No Return, No Refund” Basis',
        'The buyer accepts the material in its existing condition after conducting their own inspection.'
      ]
    },
    {
      id: 'clause-5',
      number: '5',
      title: 'Inspection',
      content: [
        '5.1 Buyers are encouraged to inspect the material physically before participating in any auction.',
        '5.2 Submission of a bid shall be deemed as confirmation that the bidder has inspected or voluntarily waived inspection and is fully satisfied with the material.',
        '5.3 No claim regarding quality, quantity, specification, condition, suitability, or description shall be entertained after the auction closes.'
      ]
    },
    {
      id: 'clause-6',
      number: '6',
      title: 'Bidding Rules',
      content: [
        '6.1 Every bid placed through the website is final and legally binding.',
        '6.2 Users are responsible for ensuring stable internet connectivity and proper functioning of their devices while participating in auctions.',
        '6.3 SalvageReef shall not be liable for failed bids, delayed bids, incorrect bids, server interruptions, internet failures, software errors, power failures, or technical glitches.',
        '6.4 Any accidental or erroneous bid placed by the user shall remain binding.'
      ]
    },
    {
      id: 'clause-7',
      number: '7',
      title: 'Payment',
      content: [
        '7.1 Buyers shall make payment strictly as per the payment terms specified in the auction.',
        '7.2 Delay in payment may result in cancellation of the auction, forfeiture of Earnest Money Deposit (EMD), suspension of account, or any other action deemed appropriate.',
        '7.3 SalvageReef is not responsible for payment disputes between buyers and sellers.'
      ]
    },
    {
      id: 'clause-8',
      number: '8',
      title: 'Delivery & Transportation',
      content: [
        '8.1 Delivery, loading, transportation, insurance, permits, taxes, labour, statutory approvals, and logistics shall be the sole responsibility of the buyer unless otherwise specified.',
        '8.2 SalvageReef shall not be liable for delays, shortages, transportation losses, or damages occurring during loading or transit.'
      ]
    },
    {
      id: 'clause-9',
      number: '9',
      title: 'Quality, Quantity & Documentation',
      content: [
        'SalvageReef does not guarantee:',
        '• Quantity',
        '• Quality',
        '• Weight',
        '• Condition',
        '• Documentation',
        '• Ownership',
        '• Merchantability',
        '• Fitness for any purpose',
        'Any discrepancy shall be resolved directly between the buyer and seller.'
      ]
    },
    {
      id: 'clause-10',
      number: '10',
      title: 'Limitation of Liability',
      content: [
        'SalvageReef shall not be liable for any direct, indirect, incidental, consequential, punitive, special, or business losses arising from:',
        '• Participation in auctions',
        '• Purchase or sale of listed materials',
        '• Technical failures',
        '• Payment disputes',
        '• Delivery delays',
        '• Rejection of materials',
        '• Quality or quantity disputes',
        '• Regulatory or statutory issues',
        '• Loss of business, profits, revenue, goodwill, or opportunities'
      ]
    },
    {
      id: 'clause-11',
      number: '11',
      title: 'User Responsibilities',
      content: [
        'Users agree that they shall:',
        '• Provide accurate information.',
        '• Comply with all applicable laws.',
        '• Not misuse the platform.',
        '• Not manipulate auction prices.',
        '• Not interfere with the operation of the website.',
        '• Honour every successful bid.'
      ]
    },
    {
      id: 'clause-12',
      number: '12',
      title: 'Cancellation & Suspension',
      content: [
        'SalvageReef reserves the absolute right to:',
        '• Cancel any auction.',
        '• Reject any bid.',
        '• Remove any listing.',
        '• Suspend or terminate any user account.',
        '• Restrict access to the platform.',
        'Such actions may be taken without prior notice whenever considered necessary.'
      ]
    },
    {
      id: 'clause-13',
      number: '13',
      title: 'Disputes',
      content: [
        'Any dispute relating to quality, quantity, payment, transportation, documentation, delivery, or any contractual obligation shall be resolved directly between the buyer and seller.',
        'SalvageReef shall not be made a party to such disputes and shall bear no responsibility whatsoever.'
      ]
    },
    {
      id: 'clause-14',
      number: '14',
      title: 'Compliance with Laws',
      content: [
        'Users shall comply with all applicable central, state, and local laws, environmental regulations, GST provisions, labour laws, transportation rules, pollution control regulations, and any other statutory requirements.'
      ]
    },
    {
      id: 'clause-15',
      number: '15',
      title: 'Intellectual Property',
      content: [
        'All website content including logos, trademarks, designs, text, graphics, software, and other materials are the exclusive property of SalvageReef and shall not be copied, reproduced, or distributed without prior written permission.'
      ]
    },
    {
      id: 'clause-16',
      number: '16',
      title: 'Governing Law & Jurisdiction',
      content: [
        'These Terms & Conditions shall be governed by the laws of India.',
        'Any legal proceedings arising from the use of this website shall be subject to the exclusive jurisdiction of the courts located in Mumbai, Maharashtra.'
      ]
    },
    {
      id: 'clause-17',
      number: '17',
      title: 'Acceptance',
      content: [
        'By registering, listing materials, participating in auctions, placing bids, or using the SalvageReef website, every user confirms that they have read, understood, and agreed to these Terms & Conditions in full.'
      ]
    }
  ];

  const filteredSections = sections.filter(sec => 
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.content.some(line => line.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const scrollToClause = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24">
      <LegalHeaderNav />

      {/* Top Banner Header */}
      <section className="bg-[#0B192C] text-white py-12 px-4 border-b-4 border-[#D48B1C]">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#D48B1C]/20 border border-[#D48B1C]/40 text-[#D48B1C] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Gavel className="w-4 h-4" /> Official Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Terms & Conditions – <span className="text-[#D48B1C]">SalvageReef</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto">
            These Terms & Conditions govern the use of the SalvageReef website and its online auction marketplace.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        {/* Intro Alert Box */}
        <div className="bg-amber-500/10 border border-[#D48B1C]/40 rounded-2xl p-5 mb-8 flex items-start gap-4 text-slate-800 text-xs sm:text-sm">
          <Info className="w-6 h-6 text-[#D48B1C] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-900">Important Notice for All Platform Users:</p>
            <p className="text-slate-700 leading-relaxed">
              By registering, listing materials, participating in auctions, or purchasing items through the website, all users (including Sellers, Buyers, Bidders, and Visitors) agree to comply with these Terms & Conditions. SalvageReef reserves the right to amend, modify, or update these Terms & Conditions at any time without prior notice.
            </p>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search clauses (e.g. As Is, Bidding, Mumbai)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D70B8] font-medium"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-300"
          >
            <Printer className="w-4 h-4" /> Print Document
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Quick Navigation Index */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-36 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1D70B8]" /> Clauses Index ({sections.length})
              </h3>
              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1 text-xs">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToClause(sec.id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-[#1D70B8] transition-colors flex items-center justify-between font-medium"
                  >
                    <span className="truncate">{sec.number}. {sec.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Clauses Content */}
          <div className="lg:col-span-8 space-y-6">
            {filteredSections.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3 text-slate-500">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-semibold text-sm">No clauses matching your search query "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#1D70B8] font-bold underline"
                >
                  Clear search query
                </button>
              </div>
            ) : (
              filteredSections.map((sec) => (
                <div
                  key={sec.id}
                  id={sec.id}
                  className={`bg-white rounded-2xl p-6 border shadow-sm transition-all ${
                    sec.highlightBox
                      ? 'border-[#D48B1C] ring-2 ring-[#D48B1C]/20 bg-amber-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-[#D48B1C] flex items-center justify-center font-black text-xs shrink-0">
                      {sec.number}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {sec.title}
                    </h3>
                  </div>

                  {/* Special Highlight for Clause 4: Sale Basis */}
                  {sec.highlightBox && (
                    <div className="bg-amber-100/70 border border-amber-300 rounded-xl p-4 mb-4 text-amber-950 text-xs sm:text-sm font-semibold space-y-2">
                      <div className="flex items-center gap-2 text-amber-900 font-bold uppercase tracking-wide">
                        <AlertTriangle className="w-4 h-4 text-amber-700" /> Mandatory Sale Basis Terms
                      </div>
                      <p>All items on SalvageReef are strictly sold on an <strong>"AS IS WHERE IS"</strong>, <strong>"WHATEVER THERE IS"</strong>, <strong>"NO COMPLAINT"</strong>, and <strong>"NO RETURN, NO REFUND"</strong> basis.</p>
                    </div>
                  )}

                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {sec.content.map((paragraph, pIdx) => (
                      <p
                        key={pIdx}
                        className={paragraph.startsWith('•') ? 'pl-4 font-semibold text-slate-900' : ''}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
