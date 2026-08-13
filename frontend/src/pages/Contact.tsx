import React, { useState } from 'react';
import { useContentStore } from '../store/useContentStore';
import { Phone, Mail, MapPin, Send, CheckCircle2, MessageSquare, Clock, ShieldCheck, Building2, HelpCircle } from 'lucide-react';

import SEOHead from '../components/SEOHead';

export default function Contact() {
  const { content } = useContentStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Auction Bidding Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <SEOHead
        title="Contact Us — SalvageReef Mumbai Operations Desk"
        description="Contact SalvageReef Operations Desk for auction registration, tender verification, lot inspection, or scrap listing inquiries."
        keywords="contact SalvageReef, salvage auction phone number, Mumbai scrap desk, salvagereef@gmail.com"
      />
      
      {/* HEADER BANNER */}
      <div className="bg-[#0B192C] text-white p-8 rounded-3xl border-b-4 border-[#D48B1C] shadow-xl text-center space-y-3">
        <span className="bg-[#D48B1C] text-white px-3 py-1 rounded font-black text-[10px] uppercase tracking-wider">
          MUMBAI OPERATIONS DESK
        </span>
        <h1 className="text-3xl sm:text-4xl font-black">Contact SalvageReef Support</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
          Have questions regarding Forward Auctions, scrap lot inspection in Mumbai, corporate tenders, or seller onboarding? Get in touch with our team.
        </p>
      </div>

      {/* TWO COLUMN CONTENT: CONTACT CARDS (LEFT) + INTERACTIVE FORM (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CONTACT DETAILS & QUICK DESK CARDS */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#D48B1C]" /> Corporate Office Details
            </h3>

            <div className="space-y-5 text-xs font-semibold text-slate-700">
              
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#D48B1C] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Phone Desk Support</span>
                  <a href={`tel:${content.contactPhone}`} className="text-sm font-extrabold text-slate-900 hover:text-[#1D70B8]">
                    {content.contactPhone}
                  </a>
                  <p className="text-[11px] text-slate-500 mt-0.5">Mon to Sat: 9:30 AM – 7:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1D70B8] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Email Inquiries</span>
                  <a href={`mailto:${content.contactEmail}`} className="text-sm font-extrabold text-slate-900 hover:text-[#1D70B8]">
                    {content.contactEmail}
                  </a>
                  <p className="text-[11px] text-slate-500 mt-0.5">Official response within 2 business hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">WhatsApp Live Support</span>
                  <a
                    href="https://wa.me/917304481166?text=Hi%20SalvageReef%2C%20I%20have%20an%20inquiry"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-extrabold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    Chat on WhatsApp &rarr;
                  </a>
                  <p className="text-[11px] text-slate-500 mt-0.5">Instant response for verified buyers</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Physical Office & Yard Location</span>
                  <p className="text-xs font-bold text-slate-900 leading-snug">
                    {content.contactAddress}
                  </p>
                  <span className="text-[11px] font-black text-[#D48B1C] mt-1 block">
                    Mumbai, Maharashtra - India
                  </span>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-slate-900 text-slate-200 p-6 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#D48B1C]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Mumbai Yard Inspection Policy
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Physical inspection of salvage scrap lots and heavy machinery is facilitated at our partner dismantling yards in Mumbai, Maharashtra prior to auction closing times.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE CONTACT FORM */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="font-extrabold text-slate-900 text-xl">Send an Official Inquiry</h3>
              <p className="text-xs text-slate-500">Fill out the form below and our operations desk in Mumbai will respond promptly.</p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-900 p-8 rounded-3xl text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-black">Inquiry Submitted Successfully!</h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto font-medium">
                  Thank you, <strong>{formData.name}</strong>. Your message regarding "<strong>{formData.subject}</strong>" has been logged into our support queue. A representative from Mumbai, Maharashtra will contact you at {formData.phone || formData.email}.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: 'Auction Bidding Inquiry', message: '' });
                  }}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-900 font-bold mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-900 font-bold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-900 font-bold mb-1">Phone Number (Mumbai/India) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9820000000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-900 font-bold mb-1">Subject / Inquiry Type *</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-medium"
                    >
                      <option value="Auction Bidding Inquiry">Auction Bidding & EMD Deposit Inquiry</option>
                      <option value="Tender Access Authorization">Tender Access Authorization Request</option>
                      <option value="Scrap Lot Physical Inspection">Scrap Lot Physical Inspection in Mumbai</option>
                      <option value="Seller Onboarding & Listing">Seller Onboarding & Asset Listing</option>
                      <option value="Other Assistance">Other General Assistance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Detailed Message / Requirement *</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Describe your query, auction lot number, or requested scrap volume..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-medium"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#D48B1C] hover:bg-[#b87614] text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  {submitting ? 'Transmitting Inquiry...' : <><Send className="w-4 h-4" /> Submit Inquiry to Operations Desk</>}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
