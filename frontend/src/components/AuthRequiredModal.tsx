import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, FileText, Download, Image as ImageIcon, CheckCircle, ArrowRight, X, ShieldCheck, Clock, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  type?: 'pdf' | 'images' | 'document' | 'general' | 'bidding' | 'listing';
}

export default function AuthRequiredModal({
  isOpen,
  onClose,
  title,
  description,
  type = 'pdf',
}: AuthRequiredModalProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  if (!isOpen) return null;

  const isUnverifiedUser = isAuthenticated && user && (user.is_verified === false || user.is_verified === 0 || user.is_verified === '0' || (user.is_verified as any) === 'false');

  const handleLoginRedirect = () => {
    onClose();
    navigate('/login');
  };

  const handleRegisterRedirect = () => {
    onClose();
    navigate('/register');
  };

  const handleDashboardRedirect = () => {
    onClose();
    navigate('/dashboard');
  };

  const isPdf = type === 'pdf';
  const isImage = type === 'images';
  const isBidding = type === 'bidding';
  const isListing = type === 'listing';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-[#0B192C] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D48B1C]/20 border border-[#D48B1C]/40 flex items-center justify-center text-[#D48B1C] shadow-inner shrink-0">
              {isUnverifiedUser ? (
                <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
              ) : isPdf ? (
                <FileText className="w-6 h-6 text-[#D48B1C]" />
              ) : isImage ? (
                <ImageIcon className="w-6 h-6 text-[#D48B1C]" />
              ) : (
                <Lock className="w-6 h-6 text-[#D48B1C]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${isUnverifiedUser ? 'bg-amber-400 text-amber-950' : 'bg-[#D48B1C] text-slate-900'}`}>
                  {isUnverifiedUser ? 'Verification Pending Admin Approval' : 'Authentication Required'}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                {title || (
                  isUnverifiedUser
                    ? 'Account Verification Required'
                    : isPdf
                    ? 'Login to Download PDF Dossier'
                    : isImage
                    ? 'Login to Download Lot Images'
                    : isBidding
                    ? 'Login Required to Place Bid'
                    : 'Login / Register Required'
                )}
              </h3>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            {description || (
              isUnverifiedUser
                ? 'Thank you for registering! Your submitted profile details and KYC documents (PAN, GST, Bank Cheque) are currently under review by our Admin Team. Full authority for live bidding, saving photos, downloading PDF dossiers, and posting listings will be unlocked as soon as your account is approved.'
                : isPdf
                ? 'Official lot inspection dossiers, technical specification sheets, and verified auction documents are available exclusively to registered & Admin-approved members.'
                : isImage
                ? 'High-resolution yard photo archives and material inspection media are protected for registered & Admin-approved scrap buyers and sellers.'
                : isBidding
                ? 'Live bidding authority is reserved for registered & Admin-approved verified buyers.'
                : isListing
                ? 'Posting scrap listings requires a registered & Admin-approved vendor account.'
                : 'This action is restricted to registered & Admin-approved members.'
            )}
          </p>

          {/* Member Benefits or Pending Status Banner */}
          {isUnverifiedUser ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#D48B1C]" />
                Account Status: Under Review
              </h4>
              <p className="text-[11px] text-amber-800 leading-normal font-medium">
                Our compliance team is verifying your registration. To expedite your verification, you can contact the Admin Desk directly.
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D48B1C]" />
                Verified Member Privileges
              </h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Unlimited PDF lot dossiers & spec downloads</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Full-resolution photo galleries & yard media saving</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Live bidding access & direct tender submission</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            {isUnverifiedUser ? (
              <>
                <button
                  onClick={handleDashboardRedirect}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#D48B1C] to-amber-600 hover:from-amber-600 hover:to-[#D48B1C] text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>Go to Buyer Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="https://wa.me/919820123456?text=Hello%20SalvageReef%20Admin,%20please%20verify%20my%20KYC%20registration."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Contact Admin Desk for Fast Approval</span>
                </a>
              </>
            ) : (
              <>
                <button
                  onClick={handleRegisterRedirect}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#D48B1C] to-amber-600 hover:from-amber-600 hover:to-[#D48B1C] text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>Create Free Account / Register</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleLoginRedirect}
                  className="w-full py-2.5 px-4 bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Already registered? Log In</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors text-center"
            >
              Continue Browsing as Visitor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
