import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Award, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Building2, 
  Boxes, 
  Truck, 
  Scale, 
  FileText, 
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export default function About() {
  const categories = [
    { name: 'Capital Equipment', desc: 'Heavy industrial machinery & plant equipment', icon: Building2 },
    { name: 'Distressed Cargo', desc: 'Transit damaged or insurance salvage goods', icon: Truck },
    { name: 'Scrap & Metal Assets', desc: 'Ferrous, non-ferrous scrap & industrial waste', icon: Boxes },
    { name: 'Obsolete & Old Stocks', desc: 'Surplus inventory, liquidations & overstock', icon: Award },
    { name: 'Rejected Merchandise', desc: 'Manufacturing seconds & quality rejected lots', icon: Scale },
    { name: 'Fleet & Vehicles', desc: 'Commercial salvage vehicles & scrap fleets', icon: TrendingUp }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0B192C] via-[#1E293B] to-[#0B192C] text-white py-16 px-4 overflow-hidden border-b-4 border-[#D48B1C]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D48B1C_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#D48B1C]/20 border border-[#D48B1C]/40 text-[#D48B1C] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" /> Incorporated in 2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            About <span className="text-[#D48B1C]">SalvageReef</span>
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Pioneering transparent and professional Forward Auctions for salvage, scrap, and industrial asset disposal across India.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 space-y-12">
        {/* Core Mission & Marketplace Overview */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/50 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-[#1D70B8] text-xs font-black uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
              Who We Are
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Transparent & Efficient Marketplace for Distressed & Idle Assets
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              <strong className="text-slate-800">SalvageReef</strong> is an online marketplace that provides Forward Auctions for the transparent and efficient buying and selling of damaged, distressed, obsolete, old, rejected, abandoned, second-hand, or otherwise unwanted assets, capital equipment, cargo, and merchandise.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Incorporated in 2026, SalvageReef is a pioneer in the professional disposal of salvage and scrap. Through its online auctions and listings, SalvageReef has helped the insurance and manufacturing industries maximize recovery and minimize losses from salvage.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Maximize Asset Recovery
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Minimize Financial Losses
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fair & Standardized Bidding
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-[#0B192C] text-white p-7 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <ShieldCheck className="w-8 h-8 text-[#D48B1C]" />
              <div>
                <h3 className="font-bold text-white text-base">Strict KYC Norms</h3>
                <p className="text-slate-400 text-xs">Verified & Reputable Network</p>
              </div>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              With a strong focus on transparency at every stage of the online auction process, SalvageReef is committed to offering a superior pool of buyers.
            </p>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Our strict Know Your Customer (KYC) norms ensure that all participating parties are screened and verified through a proper identification process, ensuring that only reputable sellers and genuine buyers participate.
            </p>
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-center">
              <span className="text-[#D48B1C] font-black text-sm uppercase tracking-wider block">100% Screened Participants</span>
              <span className="text-slate-400 text-xs">Ensuring authentic market transactions</span>
            </div>
          </div>
        </div>

        {/* Vision & Diverse Team */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1D70B8] flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Diverse & Experienced Team</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              The SalvageReef team comprises professionals with diverse backgrounds who share a common vision of creating a broader marketplace for the trade of salvage, scrap, and a wide range of goods and services.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Our seasoned domain experts bring unmatched industry knowledge in insurance claims, scrap valuation, legal compliance, and auction logistics.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D48B1C] flex items-center justify-center font-bold">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Professional & Standardized Process</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Through a professional, standardized, and fair auction process, we help businesses efficiently trade salvage and idle assets while benefiting both industry and the economy.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              We ensure structured tendering, transparent price discovery, and zero tolerance for price manipulation or non-compliance.
            </p>
          </div>
        </div>

        {/* Material & Asset Portfolio Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Asset & Salvage Categories Covered</h2>
            <p className="text-slate-500 text-sm">Empowering trades across diverse industrial spectrums</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#D48B1C] flex items-center justify-center">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Bar */}
        <div className="bg-gradient-to-r from-[#0B192C] to-[#1E293B] text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-l-8 border-[#D48B1C]">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black">Ready to maximize your salvage recovery?</h3>
            <p className="text-slate-300 text-xs sm:text-sm">Register as a buyer or contact our team to list your surplus assets today.</p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <Link
              to="/register"
              className="bg-[#D48B1C] hover:bg-[#b87614] text-white font-bold px-6 py-3 rounded-xl shadow transition-colors text-sm flex items-center gap-2"
            >
              Register Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/auctions"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl border border-white/20 transition-colors text-sm"
            >
              Explore Auctions
            </Link>
          </div>
        </div>

        {/* Contact Info Footer Block */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <h3 className="text-slate-900 font-bold text-base mb-4 border-b border-slate-200 pb-2">Corporate Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#D48B1C] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Office Address</p>
                <p className="text-slate-600">101 Imperial Bldg, Bhayander West, Thane 401101, Maharashtra</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#D48B1C] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Contact Number</p>
                <a href="tel:7304481166" className="text-[#1D70B8] hover:underline font-bold">+91 7304481166</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#D48B1C] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Email Support</p>
                <a href="mailto:salvagereef@gmail.com" className="text-[#1D70B8] hover:underline font-medium">salvagereef@gmail.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
