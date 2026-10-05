import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../services/api';
import { compressAndSanitizeImage, processUploadFile, isPdfDocument, formatBytes, CompressionResult } from '../utils/imageCompressor';
import { Tag, PlusCircle, AlertCircle, RefreshCw, UploadCloud, Image as ImageIcon, ShieldCheck, CheckCircle2, Info, Check, XCircle, Lock, Phone, Mail, Building2, MapPin, FileText, ArrowRight, Send } from 'lucide-react';
import { useCategoryLocationStore, STATE_CITIES_MAP, INDIAN_STATES } from '../store/useCategoryLocationStore';
import SEOHead from '../components/SEOHead';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(15, 'Description must be at least 15 characters'),
  category_id: z.string().min(1, 'Please select a category'),
  custom_category: z.string().optional(),
  price: z.coerce.number().positive('Price must be a positive number'),
  quantity: z.coerce.number().positive('Quantity must be a positive number'),
  unit: z.string().min(1, 'Unit is required (e.g. MT, kg, Nos, Lot)'),
  location_city: z.string().min(2, 'City is required'),
  location_state: z.string().min(2, 'State is required'),
  site_address: z.string().optional(),
  gst_number: z.string().optional(),
  seller_name: z.string().min(2, 'Seller / Contact Person Name is required'),
  seller_phone: z.string().min(10, 'Valid 10-digit mobile number is required'),
  seller_email: z.string().email('Valid email address is required'),
});

type FormData = z.infer<typeof schema>;

export default function PostListing() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { categories } = useCategoryLocationStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  const isVerified = isAuthenticated && user && (user.is_verified === true || user.is_verified === 1 || user.is_verified === '1');

  // Access Restriction: Open for EVERY registered user after login!
  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-[#D48B1C] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Registration & Sign In Required</h2>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          Selling your scrap lot on SalvageReef is available to all registered users. Please sign in or create a free account to submit your scrap details directly to our operations desk.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link to="/login" className="px-5 py-2.5 bg-[#D48B1C] hover:bg-[#b87614] text-white font-bold rounded-xl text-xs shadow transition-all">
            Sign In to Sell Scrap
          </Link>
          <Link to="/register" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs shadow transition-all">
            Register Free Account
          </Link>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-3xl border border-amber-300 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-[#D48B1C] rounded-2xl flex items-center justify-center mx-auto shadow-inner ring-4 ring-amber-200">
          <Lock className="w-8 h-8 text-[#D48B1C]" />
        </div>
        <span className="bg-amber-200 text-amber-950 font-black text-[10px] uppercase px-3 py-1 rounded-full inline-block border border-amber-300">
          Account Verification Pending Admin Approval
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900">Posting Restricted Until Account Verification</h2>
        <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
          Your submitted profile details and KYC documents (PAN, GST, Bank Cheque) are currently under review by our Admin Team. Authority to post scrap listings will be activated immediately once Admin approves your account.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-[#D48B1C] hover:bg-[#B87514] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
          >
            <span>Go to Buyer Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://wa.me/919820123456?text=Hello%20SalvageReef%20Admin,%20please%20verify%20my%20KYC%20registration."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <span>Contact Admin Desk</span>
          </a>
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      unit: 'MT',
      location_state: 'Maharashtra',
      location_city: 'Mumbai',
      seller_name: user?.name || '',
      seller_phone: user?.phone || '',
      seller_email: user?.email || '',
      gst_number: '',
    },
  });

  const [compressedImage, setCompressedImage] = useState<CompressionResult | null>(null);
  const [compressing, setCompressing] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // State/City/Category selectors
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [customCat, setCustomCat] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [customState, setCustomState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('Mumbai');
  const [customCity, setCustomCity] = useState<string>('');

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    setCompressing(true);
    try {
      const result = await processUploadFile(file, 1200, 900, 0.82);
      setCompressedImage(result);
    } catch (err: any) {
      setImageError(err.message || 'File processing failed');
      setCompressedImage(null);
    } finally {
      setCompressing(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setSubmitting(true);

    try {
      const categoryObj = categories.find((c) => c.id.toString() === data.category_id);
      const categoryName = selectedCat === 'custom' ? customCat || 'Custom Category' : categoryObj?.name || 'General Scrap';

      const resolvedState = selectedState === 'custom' ? (customState.trim() || 'Maharashtra') : data.location_state;
      const resolvedCity = (selectedState === 'custom' || selectedCity === 'custom') ? (customCity.trim() || 'Mumbai') : data.location_city;

      const payload = {
        ...data,
        category_name: categoryName,
        location_state: resolvedState,
        location_city: resolvedCity,
        image_url: compressedImage ? compressedImage.dataUrl : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
        submitted_at: new Date().toISOString(),
        user_id: user?.id,
        status: 'pending',
      };

      // Submit directly to admin sell-scrap-requests endpoint
      await api.post('/sell-scrap-requests', payload);

      try {
        const { broadcastRealtimeEvent } = await import('../services/realtimeSync');
        broadcastRealtimeEvent('scrap_request_created', payload);
      } catch (e) {}

      setSubmittedData(payload);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to submit scrap details to Admin Desk. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW AFTER SUBMISSION
  if (submittedData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <SEOHead title="Scrap Request Submitted — SalvageReef Admin Desk" description="Your scrap submission has been received by SalvageReef operations team." />
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-6 text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="bg-amber-100 text-amber-900 font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">
              Sent Directly to Admin Desk
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Scrap Request Submitted Successfully!</h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-lg mx-auto">
              Thank you, <strong className="text-slate-900">{submittedData.seller_name}</strong>! Your scrap lot details have been securely recorded and dispatched to the SalvageReef Operations Desk.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-3 font-medium text-slate-700">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-extrabold text-slate-900 text-sm">{submittedData.title}</span>
              <span className="font-black text-[#D48B1C] text-sm">₹{Number(submittedData.price).toLocaleString('en-IN')}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 block">Category:</span>
                <span className="font-bold text-slate-900">{submittedData.category_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Quantity & Unit:</span>
                <span className="font-bold text-slate-900">{submittedData.quantity} {submittedData.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Location:</span>
                <span className="font-bold text-slate-900">{submittedData.location_city}, {submittedData.location_state}</span>
              </div>
              <div>
                <span className="text-slate-400 block">GST Number:</span>
                <span className="font-bold text-slate-900">{submittedData.gst_number || 'N/A (Individual)'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Contact Person:</span>
                <span className="font-bold text-slate-900">{submittedData.seller_name} ({submittedData.seller_phone})</span>
              </div>
              <div>
                <span className="text-slate-400 block">Contact Email:</span>
                <span className="font-bold text-slate-900">{submittedData.seller_email}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 text-xs text-left space-y-1 font-medium">
            <p className="font-black flex items-center gap-1.5 text-amber-950">
              <Info className="w-4 h-4 text-[#D48B1C] shrink-0" /> What Happens Next?
            </p>
            <p className="text-[11px] leading-relaxed text-amber-800">
              This scrap item is <strong>NOT</strong> posted directly on the live website. Our SalvageReef Admin Desk will inspect your submitted details and contact you directly at <strong className="text-slate-900">{submittedData.seller_phone}</strong> to coordinate listing and buyer matching.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => {
                setSubmittedData(null);
                setCompressedImage(null);
              }}
              className="px-5 py-3 bg-[#D48B1C] hover:bg-[#b87614] text-white font-extrabold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Submit Another Scrap Lot
            </button>
            <Link
              to="/dashboard"
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition-all flex items-center justify-center gap-2"
            >
              Back to Dashboard &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <SEOHead
        title="Sell Your Scrap — SalvageReef Marketplace"
        description="Submit your scrap machinery, metal waste, industrial equipment, or factory scrap directly to SalvageReef Admin Desk for listing assistance."
      />

      {/* Page Header */}
      <div className="bg-[#0B192C] text-white p-6 rounded-3xl border-b-4 border-[#D48B1C] shadow-lg flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#D48B1C]/20 text-[#D48B1C] flex items-center justify-center font-bold">
          <Tag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Sell Your Scrap</h1>
          <p className="text-xs text-slate-300">Submit scrap details directly to SalvageReef Admin Desk — our operations team will contact you to list your lot</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
        {serverError && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* SECTION 1: SELLER CONTACT & COMPLIANCE */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Building2 className="w-4 h-4 text-[#D48B1C]" /> Seller Contact & Business Compliance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('seller_name')}
                    placeholder="Enter full name"
                    className="w-full p-3 pl-9 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {errors.seller_name && <p className="text-red-500 text-[11px] mt-1">{errors.seller_name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / Phone Number *</label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('seller_phone')}
                    placeholder="Enter mobile number"
                    className="w-full p-3 pl-9 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {errors.seller_phone && <p className="text-red-500 text-[11px] mt-1">{errors.seller_phone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    {...register('seller_email')}
                    placeholder="Enter email address"
                    className="w-full p-3 pl-9 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {errors.seller_email && <p className="text-red-500 text-[11px] mt-1">{errors.seller_email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GST Number (Optional / Corporate)</label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('gst_number')}
                    placeholder="Enter GSTIN (if applicable)"
                    className="w-full p-3 pl-9 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-mono font-bold uppercase"
                  />
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: SCRAP MATERIAL & PRICING */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#D48B1C]" /> Scrap Material & Quantity Details
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Scrap / Material Title *</label>
              <input
                type="text"
                {...register('title')}
                placeholder="Enter scrap / material title"
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold"
              />
              {errors.title && <p className="text-red-500 text-[11px] mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scrap Category *</label>
                <select
                  value={selectedCat}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCat(val);
                    setValue('category_id', val === 'custom' ? '1' : val, { shouldValidate: true });
                  }}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id.toString()}>
                      {c.name}
                    </option>
                  ))}
                  <option value="custom">➕ Write Own Custom Category...</option>
                </select>
                {selectedCat === 'custom' && (
                  <input
                    type="text"
                    placeholder="Type custom category name..."
                    value={customCat}
                    onChange={(e) => {
                      setCustomCat(e.target.value);
                      setValue('custom_category', e.target.value);
                    }}
                    className="w-full mt-2 p-3 text-xs bg-white border-2 border-[#D48B1C] rounded-xl font-bold text-slate-900"
                  />
                )}
                {errors.category_id && <p className="text-red-500 text-[11px] mt-1">{errors.category_id.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected / Asking Price (₹) *</label>
                <input
                  type="number"
                  {...register('price')}
                  placeholder="Enter expected amount"
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-extrabold text-slate-900"
                />
                {errors.price && <p className="text-red-500 text-[11px] mt-1">{errors.price.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('quantity')}
                  placeholder="Enter quantity"
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold"
                />
                {errors.quantity && <p className="text-red-500 text-[11px] mt-1">{errors.quantity.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit *</label>
                <input
                  type="text"
                  {...register('unit')}
                  placeholder="e.g. MT, kg, Nos"
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold"
                />
                {errors.unit && <p className="text-red-500 text-[11px] mt-1">{errors.unit.message}</p>}
              </div>
            </div>

            {/* State & City Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    const newState = e.target.value;
                    setSelectedState(newState);
                    setValue('location_state', newState);
                    if (newState === 'custom') {
                      setSelectedCity('custom');
                      setValue('location_city', 'custom');
                    } else {
                      const firstCity = STATE_CITIES_MAP[newState]?.[0] || 'Mumbai';
                      setSelectedCity(firstCity);
                      setValue('location_city', firstCity);
                    }
                  }}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                  <option value="custom">➕ Custom / Other State...</option>
                </select>
                {selectedState === 'custom' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter state name"
                    value={customState}
                    onChange={(e) => {
                      setCustomState(e.target.value);
                      setValue('location_state', e.target.value);
                    }}
                    className="w-full mt-2 p-3 text-xs bg-white border-2 border-[#D48B1C] rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                {selectedState === 'custom' ? (
                  <input
                    type="text"
                    required
                    placeholder="Enter city name"
                    value={customCity}
                    onChange={(e) => {
                      setCustomCity(e.target.value);
                      setValue('location_city', e.target.value);
                    }}
                    className="w-full p-3 text-xs bg-white border-2 border-[#D48B1C] rounded-xl font-bold text-slate-900 focus:outline-none"
                  />
                ) : (
                  <>
                    <select
                      value={selectedCity}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedCity(val);
                        setValue('location_city', val === 'custom' ? customCity || 'Mumbai' : val);
                      }}
                      className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold"
                    >
                      {(STATE_CITIES_MAP[selectedState] || ['Mumbai']).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="custom">➕ Custom / Other City...</option>
                    </select>
                    {selectedCity === 'custom' && (
                      <input
                        type="text"
                        placeholder="Enter city name"
                        value={customCity}
                        onChange={(e) => {
                          setCustomCity(e.target.value);
                          setValue('location_city', e.target.value);
                        }}
                        className="w-full mt-2 p-3 text-xs bg-white border-2 border-[#D48B1C] rounded-xl font-bold text-slate-900"
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Site / Yard Inspection Address</label>
              <input
                type="text"
                {...register('site_address')}
                placeholder="Enter address details"
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
              />
            </div>
          </div>

          {/* SECTION 3: WEBP COMPRESSED PRODUCT PHOTO UPLOAD */}
          <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
              <label className="text-slate-900 font-extrabold text-xs flex items-center gap-1.5 shrink-0">
                <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Secure Product Photo Upload</span>
              </label>
              <span className="text-[10px] text-emerald-800 font-black bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 shrink-0 whitespace-nowrap self-start sm:self-auto">
                <Lock className="w-3 h-3 text-emerald-700 shrink-0" />
                <span>Canvas WebP Compression & Security Sanitized</span>
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-2 font-medium">
              <div className="flex items-center gap-1.5 text-slate-900">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span><strong>Documents:</strong> PDF (Up to 25 MB)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Photos:</strong> WebP, JPG, PNG, GIF</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D48B1C] shrink-0" />
                <span><strong>Security:</strong> Header verified</span>
              </div>
            </div>

            {imageError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{imageError}</span>
              </div>
            )}

            <div className="relative border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-white transition-all group">
              <input
                type="file"
                accept="image/*,application/pdf,.pdf"
                onChange={handleImageFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              {compressing ? (
                <div className="space-y-2 py-4">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Processing file & verifying binary header...</p>
                </div>
              ) : compressedImage ? (
                <div className="space-y-3">
                  {compressedImage.isPdf ? (
                    <div className="w-56 mx-auto p-4 rounded-2xl border-2 border-red-500 bg-red-50 shadow-md flex flex-col items-center justify-center space-y-2 relative">
                      <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-black text-slate-900 truncate max-w-[200px]" title={compressedImage.fileName}>
                        {compressedImage.fileName}
                      </div>
                      <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-1 shadow">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-44 h-32 mx-auto rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md relative group">
                      <img src={compressedImage.dataUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-1 shadow">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}

                  <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-slate-900 text-white text-[11px] px-4 py-2 rounded-xl font-mono shadow">
                    <span>Name: {compressedImage.fileName}</span>
                    <span>&bull;</span>
                    <span>Type: <span className="text-amber-300 font-bold">{compressedImage.isPdf ? 'PDF Document' : 'WebP Image'}</span></span>
                    <span>&bull;</span>
                    <span>Size: <span className="text-emerald-400 font-black">{compressedImage.compressedSizeStr}</span></span>
                  </div>

                  <p className="text-[10px] text-slate-400 block font-sans">Click or drag a new image or PDF document to replace.</p>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-emerald-600 mx-auto transition-colors" />
                  <p className="text-xs font-bold text-slate-800">Click or Drag & Drop Product Photo or PDF Document Here</p>
                  <p className="text-[10px] text-slate-400">Supports PDF documents & high-res JPG, PNG, WEBP & GIF.</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: MATERIAL DESCRIPTION */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Description & Material Specifications *</label>
            <textarea
              rows={4}
              {...register('description')}
              placeholder="Describe machine condition, metal purity, scrap quality, inspection availability..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
            ></textarea>
            {errors.description && <p className="text-red-500 text-[11px] mt-1">{errors.description.message}</p>}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting || compressing}
            className="w-full py-3 bg-[#D48B1C] hover:bg-[#B87514] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 uppercase tracking-wider"
          >
            {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Submit Scrap Details to Admin Desk
          </button>
        </form>
      </div>
    </div>
  );
}
