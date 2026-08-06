import React from 'react';
import LegalHeaderNav from '../components/LegalHeaderNav';
import { 
  ShieldCheck, 
  Lock, 
  Cookie, 
  Mail, 
  EyeOff, 
  CheckCircle2, 
  HelpCircle, 
  Server, 
  Globe, 
  Calendar, 
  Laptop
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  const visitDataPoints = [
    { title: 'IP Address', desc: 'Internet protocol address from which the website is accessed.', icon: Globe },
    { title: 'Browser & Operating System', desc: 'Type of browser software and operating system used.', icon: Laptop },
    { title: 'Access Timestamp', desc: 'Exact date and time of site access.', icon: Calendar },
    { title: 'Pages & Files Downloaded', desc: 'Specific pages visited and documents downloaded.', icon: Server },
    { title: 'Referring Website', desc: 'Referring web address if arrived via another website.', icon: Globe },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24">
      <LegalHeaderNav />

      {/* Top Hero Banner */}
      <section className="bg-[#0B192C] text-white py-12 px-4 border-b-4 border-[#D48B1C]">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#D48B1C]/20 border border-[#D48B1C]/40 text-[#D48B1C] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Data Protection & Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Privacy Policy – <span className="text-[#D48B1C]">SalvageReef</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto">
            Your privacy is paramount. Learn how SalvageReef protects visitor data and safeguards your online experience.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10 space-y-10">
        {/* Core Privacy Promise Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md grid grid-cols-1 md:grid-cols-3 gap-6 text-center border-t-4 border-[#1D70B8]">
          <div className="space-y-2 p-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">No Personal Tracking</h3>
            <p className="text-slate-500 text-xs">Browse freely without revealing personal identity.</p>
          </div>

          <div className="space-y-2 p-3 border-t md:border-t-0 md:border-l border-slate-200">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-[#D48B1C] mx-auto flex items-center justify-center">
              <Cookie className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Zero Cookies Used</h3>
            <p className="text-slate-500 text-xs">We do not store or send browser tracking cookies.</p>
          </div>

          <div className="space-y-2 p-3 border-t md:border-t-0 md:border-l border-slate-200">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1D70B8] mx-auto flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Strict Consent Policy</h3>
            <p className="text-slate-500 text-xs">No email sharing or third-party mailing lists.</p>
          </div>
        </div>

        {/* General Rule & Overview */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="w-5 h-5 text-[#1D70B8]" /> General Browsing Principles
          </h2>
          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
            As a general rule, this website does not collect personal information about users when they visit the site. Users can generally browse the website without revealing any personal information unless they choose to provide it voluntarily.
          </p>
        </div>

        {/* Site Visit Data Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1 border-b border-slate-100 pb-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-[#D48B1C]" /> Site Visit Data
            </h2>
            <p className="text-slate-500 text-xs">This website records the following information regarding user visits solely for statistical and analytical purposes:</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visitDataPoints.map((pt, idx) => {
              const IconComp = pt.icon;
              return (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-[#D48B1C] flex items-center justify-center shrink-0 mt-0.5">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">{pt.title}</h3>
                    <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">{pt.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-xs text-blue-900 space-y-2">
            <p className="font-bold">Purpose of Analytics:</p>
            <p className="leading-relaxed">
              This information is used solely to help SalvageReef improve the website's performance and enhance the user experience.
            </p>
            <p className="leading-relaxed text-blue-800">
              SalvageReef does not track or record personally identifiable information about individual visitors. SalvageReef makes no attempt to link this information with the identity of users unless an attempt to damage the website has been detected or when required by law or a valid legal request from law enforcement authorities.
            </p>
          </div>
        </div>

        {/* Cookies & Email Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cookies */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D48B1C] flex items-center justify-center font-bold">
                <Cookie className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Cookies</h3>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              A cookie is a small piece of software code that a website sends to a user's browser when the user accesses information on the site.
            </p>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>This website does not use cookies.</span>
            </div>
          </div>

          {/* Email Management */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D70B8] flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Email Management</h3>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              A user's email address will only be recorded if they choose to send us a message. It will be used solely for the purpose for which it was provided and will not be added to any mailing list.
            </p>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              The email address will not be used for any other purpose or disclosed to any third party without the user's consent, unless required by law.
            </p>
          </div>
        </div>

        {/* Collection of Personal Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <HelpCircle className="w-5 h-5 text-[#D48B1C]" /> Collection of Personal Information & Feedback
          </h2>
          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
            If users are asked to provide any additional personal information, they will be informed about how that information will be used before it is collected.
          </p>
          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
            If, at any time, a user believes that the principles outlined in this Privacy Policy have not been followed or has any comments or concerns, they may contact the webmaster through email at <a href="mailto:salvagereef@gmail.com" className="text-[#1D70B8] font-bold hover:underline">salvagereef@gmail.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
