import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import {
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Eye,
  EyeOff,
  Upload,
  FileText,
  Building2,
  CreditCard,
  ShieldCheck,
  Info,
  Check,
  XCircle,
  ImageIcon,
  Globe,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { compressAndSanitizeImage, isPdfDocument, formatBytes } from '../utils/imageCompressor';

export interface CountryConfig {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  phoneDigitsMsg: string;
  minDigits: number;
  maxDigits: number;
  isIndia: boolean;
}

export const COUNTRY_OPTIONS: CountryConfig[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', phoneDigitsMsg: '10 digits starting with 6-9 (e.g. 9820123456)', minDigits: 10, maxDigits: 10, isIndia: true },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', phoneDigitsMsg: '9 digits starting with 5 (e.g. 501234567)', minDigits: 9, maxDigits: 9, isIndia: false },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', phoneDigitsMsg: '10 digits (e.g. 2125551234)', minDigits: 10, maxDigits: 10, isIndia: false },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', phoneDigitsMsg: '10-11 digits (e.g. 7911123456)', minDigits: 10, maxDigits: 11, isIndia: false },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', phoneDigitsMsg: '9 digits starting with 5 (e.g. 512345678)', minDigits: 9, maxDigits: 9, isIndia: false },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', phoneDigitsMsg: '8 digits starting with 8 or 9 (e.g. 81234567)', minDigits: 8, maxDigits: 8, isIndia: false },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', phoneDigitsMsg: '10-11 digits (e.g. 15123456789)', minDigits: 10, maxDigits: 11, isIndia: false },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', phoneDigitsMsg: '9 digits starting with 4 (e.g. 412345678)', minDigits: 9, maxDigits: 9, isIndia: false },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', phoneDigitsMsg: '10 digits (e.g. 4165551234)', minDigits: 10, maxDigits: 10, isIndia: false },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', phoneDigitsMsg: '8 digits (e.g. 33123456)', minDigits: 8, maxDigits: 8, isIndia: false },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', phoneDigitsMsg: '8 digits (e.g. 98123456)', minDigits: 8, maxDigits: 8, isIndia: false },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', phoneDigitsMsg: '8 digits (e.g. 91234567)', minDigits: 8, maxDigits: 8, isIndia: false },
  { code: 'OTHER', name: 'Other International Country', dialCode: '+', flag: '🌐', phoneDigitsMsg: '7 to 15 digits', minDigits: 7, maxDigits: 15, isIndia: false },
];

interface FormErrors {
  country?: string;
  vendor_name?: string;
  entity_type?: string;
  pan_number?: string;
  gst_number?: string;
  state?: string;
  city?: string;
  registered_address?: string;
  pincode?: string;
  spoc_name?: string;
  phone?: string;
  email?: string;
  password?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  pan_file?: string;
  gst_file?: string;
  cheque_file?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { loginWithGoogle, error: authError } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);

  // Field validation and touched states (for instant blur & typing warnings)
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});

  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  // Document upload state previews & metadata
  const [chequeFileName, setChequeFileName] = useState<string>('');
  const [panFileName, setPanFileName] = useState<string>('');
  const [gstFileName, setGstFileName] = useState<string>('');

  const [chequeFileSize, setChequeFileSize] = useState<string>('');
  const [panFileSize, setPanFileSize] = useState<string>('');
  const [gstFileSize, setGstFileSize] = useState<string>('');

  // 3-Stage Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic & Contact Info
    country: 'IN',
    country_dial: '+91',
    country_name: 'India',
    vendor_name: '',
    entity_type: 'Proprietorship',
    pan_number: '',
    gst_number: '',
    registered_address: '',
    state: 'Maharashtra',
    city: 'Thane',
    pincode: '',
    spoc_name: '',
    phone: '',
    email: '',
    password: '',
    role: 'bidder', // Fixed bidder role

    // Step 2: Bank & Document Uploads
    bank_name: '',
    bank_account_number: '',
    bank_ifsc_code: '',
    cheque_file: '',
    pan_file: '',
    gst_file: '',
  });

  const activeCountryConfig = COUNTRY_OPTIONS.find((c) => c.code === formData.country) || COUNTRY_OPTIONS[0];

  // Strict Field Validation Engine with Country Adaptive Rules
  const validateField = (name: string, rawVal: string, currentCountry = formData.country): string | null => {
    const val = (rawVal || '').trim();
    const isIndia = currentCountry === 'IN';
    const cConfig = COUNTRY_OPTIONS.find((c) => c.code === currentCountry) || COUNTRY_OPTIONS[0];

    switch (name) {
      case 'country':
        if (!val) return 'Country is required.';
        return null;

      case 'vendor_name':
        if (!val) return 'Vendor / Firm Name is required.';
        if (val.length < 3) return 'Vendor / Firm Name must be at least 3 characters.';
        if (val.length > 100) return 'Vendor / Firm Name must not exceed 100 characters.';
        return null;

      case 'pan_number':
        if (isIndia) {
          if (!val) return 'PAN Number is required for Indian entities.';
          if (val.length !== 10) return 'PAN Number must be exactly 10 characters (e.g. ABCDE1234F).';
          if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val.toUpperCase())) {
            return 'Invalid PAN format. Must be 5 letters, 4 digits, and 1 letter (e.g. ABCDE1234F).';
          }
        } else if (val) {
          // Optional for international, but validate if entered
          if (val.length < 3 || val.length > 25) {
            return 'Tax / Identification Number must be between 3 and 25 characters.';
          }
        }
        return null;

      case 'gst_number':
        if (isIndia) {
          if (!val) return 'GST Number is required for Indian registered businesses.';
          if (val.length !== 15) return 'GST Number must be exactly 15 characters (e.g. 27ABCDE1234F1Z5).';
          if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val.toUpperCase())) {
            return 'Invalid GST format (e.g. 27ABCDE1234F1Z5). State code + PAN + entity digit + Z + checksum.';
          }
        } else if (val) {
          // Optional for international VAT / Trade License
          if (val.length < 3 || val.length > 25) {
            return 'VAT / Trade License Number must be between 3 and 25 characters.';
          }
        }
        return null;

      case 'state':
        if (!val) return isIndia ? 'State is required.' : 'State / Province / Region is required.';
        if (val.length < 2) return 'State / Province must be at least 2 characters.';
        return null;

      case 'city':
        if (!val) return 'City is required.';
        if (val.length < 2) return 'City must be at least 2 characters.';
        return null;

      case 'registered_address':
        if (!val) return 'Registered Business Address is required.';
        if (val.length < 6) return 'Business address must be at least 6 characters.';
        return null;

      case 'pincode':
        if (!val) return isIndia ? 'Pincode is required.' : 'Postal / ZIP Code is required.';
        if (isIndia) {
          if (val.length !== 6 || !/^[1-9][0-9]{5}$/.test(val)) {
            return 'Pincode must be exactly 6 numeric digits and cannot start with 0 (e.g. 401101).';
          }
        } else {
          if (val.length < 3 || val.length > 12) {
            return 'Postal / ZIP Code must be between 3 and 12 characters.';
          }
        }
        return null;

      case 'spoc_name':
        if (!val) return 'Contact Person (SPOC Name) is required.';
        if (val.length < 3) return 'Contact Person Name must be at least 3 characters.';
        if (!/^[a-zA-Z\s.]{3,50}$/.test(val)) {
          return 'Contact Person Name must contain only alphabetic characters (3 to 50 characters).';
        }
        return null;

      case 'phone':
        if (!val) return 'Mobile / Contact Number is required.';
        const cleanPhone = val.replace(/\D/g, '');
        if (isIndia) {
          if (cleanPhone.length !== 10) return 'Indian mobile number must be exactly 10 digits (e.g. 9820123456).';
          if (!/^[6-9][0-9]{9}$/.test(cleanPhone)) return 'Indian mobile number must start with 6, 7, 8, or 9 (e.g. 9820123456).';
        } else if (currentCountry === 'AE') {
          if (cleanPhone.length !== 9 || !/^5[0-9]{8}$/.test(cleanPhone)) {
            return 'UAE mobile number must be 9 digits starting with 5 (e.g. 501234567).';
          }
        } else {
          if (cleanPhone.length < cConfig.minDigits || cleanPhone.length > cConfig.maxDigits) {
            return `${cConfig.name} contact number must be ${cConfig.phoneDigitsMsg}.`;
          }
        }
        return null;

      case 'email':
        if (!val) return 'Email ID is required.';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
          return 'Please enter a valid email address (e.g. vendor@domain.com).';
        }
        return null;

      case 'password':
        if (!val) return 'Password is required.';
        if (val.length < 6) return 'Password must be at least 6 characters.';
        return null;

      case 'bank_name':
        if (!val) return 'Bank Name is required.';
        if (val.length < 3) return 'Bank Name must be at least 3 characters.';
        return null;

      case 'bank_account_number':
        if (!val) return isIndia ? 'Bank Account Number is required.' : 'Account Number / IBAN is required.';
        const cleanAcc = val.replace(/\D/g, '');
        if (isIndia) {
          if (cleanAcc.length < 9 || cleanAcc.length > 18) {
            return 'Bank Account Number must be between 9 and 18 numeric digits.';
          }
        } else {
          if (val.length < 6 || val.length > 34) {
            return 'Account Number / IBAN must be between 6 and 34 characters.';
          }
        }
        return null;

      case 'bank_ifsc_code':
        if (!val) return isIndia ? 'Bank IFSC Code is required.' : 'SWIFT / BIC Code is required.';
        if (isIndia) {
          if (val.length !== 11) return 'IFSC Code must be exactly 11 characters (e.g. HDFC0001234).';
          if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(val.toUpperCase())) {
            return 'Invalid IFSC Code format. 4 letters + 0 + 6 alphanumeric (e.g. HDFC0001234 or SBIN0001234).';
          }
        } else {
          if (val.length < 6 || val.length > 11) {
            return 'SWIFT / BIC Code must be between 6 and 11 alphanumeric characters.';
          }
        }
        return null;

      default:
        return null;
    }
  };

  // Blur Handler: Validates and shows warning as soon as user clicks out of box
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg || undefined }));
  };

  // Country Change Handler: Re-validates & syncs dial codes without stale errors
  const handleCountrySelect = (newCountryCode: string) => {
    const found = COUNTRY_OPTIONS.find((c) => c.code === newCountryCode) || COUNTRY_OPTIONS[0];
    setFormData((prev) => ({
      ...prev,
      country: found.code,
      country_dial: found.dialCode,
      country_name: found.name,
      phone: '', // reset phone to prevent formatting collision
      state: found.isIndia ? 'Maharashtra' : '',
      city: found.isIndia ? 'Thane' : '',
    }));

    // Reset country-dependent errors
    setErrors((prev) => {
      const next = { ...prev };
      delete next.phone;
      delete next.pan_number;
      delete next.gst_number;
      delete next.pincode;
      delete next.bank_ifsc_code;
      return next;
    });
    setTouched((prev) => {
      const next = { ...prev };
      delete next.phone;
      delete next.pan_number;
      delete next.gst_number;
      delete next.pincode;
      return next;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    let value = e.target.value;
    const isIndia = formData.country === 'IN';
    const cConfig = COUNTRY_OPTIONS.find((c) => c.code === formData.country) || COUNTRY_OPTIONS[0];

    // Field-specific automatic sanitization & character guards
    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, cConfig.maxDigits);
    } else if (name === 'pincode') {
      if (isIndia) {
        value = value.replace(/\D/g, '').slice(0, 6);
      } else {
        value = value.slice(0, 12);
      }
    } else if (name === 'bank_account_number') {
      if (isIndia) {
        value = value.replace(/\D/g, '').slice(0, 18);
      } else {
        value = value.toUpperCase().slice(0, 34);
      }
    } else if (name === 'pan_number') {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, isIndia ? 10 : 25);
    } else if (name === 'gst_number') {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, isIndia ? 15 : 25);
    } else if (name === 'bank_ifsc_code') {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError(null);

    // If user has already blurred this field before, re-validate on type
    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: errorMsg || undefined }));
    }
  };

  // High-Quality Document File Upload Handler with Auto-Compression & Storage
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: 'cheque_file' | 'pan_file' | 'gst_file'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5 MB.');
      return;
    }

    try {
      if (file.type.startsWith('image/')) {
        // Compress & sanitize user image for crisp quality & fast load
        const result = await compressAndSanitizeImage(file, 1600, 0.85);
        if (fieldName === 'cheque_file') {
          setChequeFileName(file.name);
          setChequeFileSize(result.compressedSizeStr);
        } else if (fieldName === 'pan_file') {
          setPanFileName(file.name);
          setPanFileSize(result.compressedSizeStr);
        } else if (fieldName === 'gst_file') {
          setGstFileName(file.name);
          setGstFileSize(result.compressedSizeStr);
        }
        setFormData((prev) => ({ ...prev, [fieldName]: result.dataUrl }));
      } else {
        // PDF fallback: convert directly to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          if (fieldName === 'cheque_file') {
            setChequeFileName(file.name);
            setChequeFileSize(formatBytes(file.size));
          } else if (fieldName === 'pan_file') {
            setPanFileName(file.name);
            setPanFileSize(formatBytes(file.size));
          } else if (fieldName === 'gst_file') {
            setGstFileName(file.name);
            setGstFileSize(formatBytes(file.size));
          }
          setFormData((prev) => ({ ...prev, [fieldName]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    } catch (err) {
      console.error('File compression error:', err);
      // Fallback
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [fieldName]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1 Validation Trigger
  const validateStep1 = (): boolean => {
    setServerError(null);
    const step1Fields = [
      'vendor_name',
      'pan_number',
      'gst_number',
      'state',
      'city',
      'registered_address',
      'pincode',
      'spoc_name',
      'phone',
      'email',
      'password',
    ];

    const newErrors: FormErrors = {};
    const newTouched: Record<string, boolean> = {};
    let hasError = false;

    step1Fields.forEach((f) => {
      newTouched[f] = true;
      const err = validateField(f, (formData as any)[f]);
      if (err) {
        newErrors[f as keyof FormErrors] = err;
        hasError = true;
      }
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (hasError) {
      const firstErr = Object.values(newErrors)[0];
      setServerError(firstErr || 'Please correct the highlighted fields before proceeding.');
      return false;
    }

    return true;
  };

  // Step 2 Validation Trigger
  const validateStep2 = (): boolean => {
    setServerError(null);
    const step2Fields = ['bank_name', 'bank_account_number', 'bank_ifsc_code'];

    const newErrors: FormErrors = {};
    const newTouched: Record<string, boolean> = {};
    let hasError = false;

    step2Fields.forEach((f) => {
      newTouched[f] = true;
      const err = validateField(f, (formData as any)[f]);
      if (err) {
        newErrors[f as keyof FormErrors] = err;
        hasError = true;
      }
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (hasError) {
      const firstErr = Object.values(newErrors)[0];
      setServerError(firstErr || 'Please correct the bank details before proceeding.');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setServerError(null);
    }
  };

  // Submit Registration Form
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setTermsError(null);

    if (!termsAccepted) {
      setTermsError('You must accept the Terms & Conditions to complete registration.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.spoc_name || formData.vendor_name,
        company_name: formData.vendor_name,
        vendor_name: formData.vendor_name,
        entity_type: formData.entity_type,
        pan_number: formData.pan_number,
        gst_number: formData.gst_number,
        registered_address: formData.registered_address,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        spoc_name: formData.spoc_name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: 'bidder', // Fixed bidder role
        bank_name: formData.bank_name,
        bank_account_number: formData.bank_account_number,
        bank_ifsc_code: formData.bank_ifsc_code,
        cheque_file: formData.cheque_file || '',
        pan_file: formData.pan_file || '',
        gst_file: formData.gst_file || '',
      };

      const res = await api.post('/auth/register', payload);

      const userToSave = {
        ...payload,
        ...(res.data?.user || {}),
        id: res.data?.user?.id || Date.now(),
        is_verified: res.data?.user?.is_verified ?? true,
        is_active: res.data?.user?.is_active ?? true,
        pan_file: formData.pan_file || res.data?.user?.pan_file || '',
        gst_file: formData.gst_file || res.data?.user?.gst_file || '',
        cheque_file: formData.cheque_file || res.data?.user?.cheque_file || '',
      };
      const tokenToSave = res.data?.token || 'verified-user-token-' + Date.now();

      // Store in users lists so Admin Panel displays all uploaded KYC proofs
      try {
        const storedAdminUsers = JSON.parse(localStorage.getItem('sr_admin_users') || '[]');
        const updatedAdminUsers = [
          userToSave,
          ...storedAdminUsers.filter((u: any) => u.email !== userToSave.email && u.id !== userToSave.id),
        ];
        localStorage.setItem('sr_admin_users', JSON.stringify(updatedAdminUsers));

        const storedAllUsers = JSON.parse(localStorage.getItem('sr_all_users') || '[]');
        const updatedAllUsers = [
          userToSave,
          ...storedAllUsers.filter((u: any) => u.email !== userToSave.email && u.id !== userToSave.id),
        ];
        localStorage.setItem('sr_all_users', JSON.stringify(updatedAllUsers));
      } catch {}

      localStorage.setItem('salvagereef_user', JSON.stringify(userToSave));
      localStorage.setItem('salvagereef_token', tokenToSave);
      localStorage.setItem('salvagereef_token_exp', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());

      useAuthStore.setState({ user: userToSave, token: tokenToSave, isAuthenticated: true });
      setRegistrationSuccess(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err: any) {
      const backendMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.gst_number?.[0] ||
        err.response?.data?.errors?.email?.[0] ||
        err.message ||
        'Registration failed';

      if (backendMsg.toLowerCase().includes('gst')) {
        setErrors((prev) => ({ ...prev, gst_number: backendMsg }));
        setCurrentStep(1);
      } else if (backendMsg.toLowerCase().includes('email')) {
        setErrors((prev) => ({ ...prev, email: backendMsg }));
        setCurrentStep(1);
      }
      setServerError(backendMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <SEOHead
        title="Vendor Registration — SalvageReef B2B Tender Portal"
        description="Register your business vendor account for salvage auctions and industrial asset tenders in Maharashtra."
      />

      {/* HEADER TITLE */}
      <div className="text-center space-y-1">
        <span className="bg-[#D48B1C]/20 text-[#D48B1C] border border-[#D48B1C]/40 text-[10px] uppercase font-black px-3 py-1 rounded-full">
          Salvage Vendor Onboarding Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Vendor Account Registration
        </h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Complete the 3-stage verification process to participate in live scrap tenders & salvage asset bidding.
        </p>
      </div>

      {/* 3-STAGE STEPPER HEADER */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
          <div
            className="absolute top-1/2 left-0 h-1 bg-[#D48B1C] -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
          ></div>

          {/* STEP 1 */}
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all shadow ${
                currentStep >= 1
                  ? 'bg-[#D48B1C] text-white ring-4 ring-[#D48B1C]/20'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {currentStep > 1 ? <CheckCircle2 className="w-5 h-5 text-white" /> : '1'}
            </div>
            <span className={`text-[11px] font-extrabold uppercase ${currentStep === 1 ? 'text-[#D48B1C]' : 'text-slate-600'}`}>
              Basic Details
            </span>
          </div>

          {/* STEP 2 */}
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all shadow ${
                currentStep >= 2
                  ? 'bg-[#D48B1C] text-white ring-4 ring-[#D48B1C]/20'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {currentStep > 2 ? <CheckCircle2 className="w-5 h-5 text-white" /> : '2'}
            </div>
            <span className={`text-[11px] font-extrabold uppercase ${currentStep === 2 ? 'text-[#D48B1C]' : 'text-slate-600'}`}>
              Bank & Uploads
            </span>
          </div>

          {/* STEP 3 */}
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all shadow ${
                currentStep === 3
                  ? 'bg-[#D48B1C] text-white ring-4 ring-[#D48B1C]/20'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              3
            </div>
            <span className={`text-[11px] font-extrabold uppercase ${currentStep === 3 ? 'text-[#D48B1C]' : 'text-slate-600'}`}>
              Terms & Review
            </span>
          </div>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
        {(serverError || authError) && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center justify-between gap-3 font-bold animate-shake">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{serverError || authError}</span>
            </div>
            {(serverError?.toLowerCase().includes('sign in') || serverError?.toLowerCase().includes('already')) && (
              <Link to="/login" className="px-3.5 py-1.5 bg-[#D48B1C] text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#B87514] shrink-0">
                Sign In Now &rarr;
              </Link>
            )}
          </div>
        )}

        {registrationSuccess ? (
          <div className="p-8 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-3xl text-center space-y-3 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-lg">Vendor Registration Successful!</h3>
            <p className="text-xs text-emerald-700 max-w-sm mx-auto">
              Your business account has been verified and registered on SalvageReef. Redirecting to your Dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-6 text-xs font-medium">
            {/* STAGE 1: BASIC & CONTACT INFORMATION */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between gap-2 text-slate-800 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#D48B1C]" />
                    <h3 className="font-black text-sm uppercase tracking-wide">Basic Information</h3>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#D48B1C]" />
                    <span>Global & Domestic Registration Enabled</span>
                  </span>
                </div>

                {/* Country / Operating Region Selection Box */}
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#D48B1C] flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">Country / Operating Region *</span>
                      <span className="text-slate-500 text-[11px]">Select your business country. Rules & phone codes adapt automatically.</span>
                    </div>
                  </div>
                  <div className="w-full sm:w-72">
                    <select
                      value={formData.country}
                      onChange={(e) => handleCountrySelect(e.target.value)}
                      className="w-full p-2.5 bg-white border-2 border-amber-300 rounded-xl font-extrabold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D48B1C] shadow-sm cursor-pointer"
                    >
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name} ({c.dialCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Vendor / Firm Name */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Vendor / Firm Name *</label>
                    <input
                      type="text"
                      name="vendor_name"
                      required
                      value={formData.vendor_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Apex Salvage Corp"
                      className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] transition-all font-semibold ${
                        touched.vendor_name && errors.vendor_name
                          ? 'border-red-500 bg-red-50/50'
                          : touched.vendor_name && !errors.vendor_name
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-slate-300'
                      }`}
                    />
                    {touched.vendor_name && errors.vendor_name && (
                      <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{errors.vendor_name}</span>
                      </p>
                    )}
                  </div>

                  {/* Entity Type */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Entity Type *</label>
                    <select
                      name="entity_type"
                      value={formData.entity_type}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-semibold"
                    >
                      <option value="Proprietorship">Proprietorship</option>
                      <option value="Private Limited">Private Limited</option>
                      <option value="Partnership">Partnership</option>
                      <option value="LLP">LLP (Limited Liability)</option>
                      <option value="Public Limited">Public Limited</option>
                      <option value="Foreign Entity / Corp">Foreign Entity / Corp</option>
                      <option value="Individual">Individual</option>
                    </select>
                  </div>

                  {/* PAN / Tax Identification Number */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">
                      {formData.country === 'IN' ? 'PAN Number *' : 'Tax ID / National ID (Optional)'}
                    </label>
                    <input
                      type="text"
                      name="pan_number"
                      required={formData.country === 'IN'}
                      maxLength={formData.country === 'IN' ? 10 : 25}
                      value={formData.pan_number}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={formData.country === 'IN' ? 'ABCDE1234F' : 'e.g. TRN / EIN / Tax ID'}
                      className={`w-full p-3 bg-slate-50 border rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#D48B1C] transition-all ${
                        touched.pan_number && errors.pan_number
                          ? 'border-red-500 bg-red-50/50'
                          : touched.pan_number && !errors.pan_number
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-slate-300'
                      }`}
                    />
                    {touched.pan_number && errors.pan_number && (
                      <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{errors.pan_number}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* GST / Trade License Number */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">
                      {formData.country === 'IN' ? 'GST Number * (Unique)' : 'VAT / Trade License No. (Optional)'}
                    </label>
                    <input
                      type="text"
                      name="gst_number"
                      required={formData.country === 'IN'}
                      maxLength={formData.country === 'IN' ? 15 : 25}
                      value={formData.gst_number}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={formData.country === 'IN' ? '27AAAAA0000A1Z5' : 'e.g. VAT / Reg License No.'}
                      className={`w-full p-3 bg-slate-50 border rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#D48B1C] transition-all ${
                        touched.gst_number && errors.gst_number
                          ? 'border-red-500 bg-red-50/50'
                          : touched.gst_number && !errors.gst_number
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-slate-300'
                      }`}
                    />
                    {touched.gst_number && errors.gst_number && (
                      <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{errors.gst_number}</span>
                      </p>
                    )}
                  </div>

                  {/* State / Province */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">
                      {formData.country === 'IN' ? 'State *' : 'State / Province / Region *'}
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={formData.country === 'IN' ? 'Maharashtra' : 'e.g. Dubai / California / London'}
                      className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] transition-all ${
                        touched.state && errors.state
                          ? 'border-red-500 bg-red-50/50'
                          : touched.state && !errors.state
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-slate-300'
                      }`}
                    />
                    {touched.state && errors.state && (
                      <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{errors.state}</span>
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={formData.country === 'IN' ? 'Thane / Mumbai' : 'City Name'}
                      className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] transition-all ${
                        touched.city && errors.city
                          ? 'border-red-500 bg-red-50/50'
                          : touched.city && !errors.city
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-slate-300'
                      }`}
                    />
                    {touched.city && errors.city && (
                      <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{errors.city}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Registered Business Address */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-900 mb-1">Registered Business Address *</label>
                    <input
                      type="text"
                      name="registered_address"
                      required
                      value={formData.registered_address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Street, Industrial Area, Sector"
                      className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] transition-all ${
                        touched.registered_address && errors.registered_address
                          ? 'border-red-500 bg-red-50/50'
                          : touched.registered_address && !errors.registered_address
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-slate-300'
                      }`}
                    />
                    {touched.registered_address && errors.registered_address && (
                      <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{errors.registered_address}</span>
                      </p>
                    )}
                  </div>

                  {/* Pincode / Postal Code */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">
                      {formData.country === 'IN' ? 'Pincode (6 Digits) *' : 'Postal / ZIP Code *'}
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      maxLength={formData.country === 'IN' ? 6 : 12}
                      value={formData.pincode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={formData.country === 'IN' ? '401101' : 'Postal / ZIP Code'}
                      className={`w-full p-3 bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#D48B1C] transition-all ${
                        touched.pincode && errors.pincode
                          ? 'border-red-500 bg-red-50/50'
                          : touched.pincode && !errors.pincode
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-slate-300'
                      }`}
                    />
                    {touched.pincode && errors.pincode && (
                      <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{errors.pincode}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* CONTACT INFORMATION */}
                <div className="border-t border-slate-200 pt-5 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800">
                    <ShieldCheck className="w-5 h-5 text-[#D48B1C]" />
                    <h3 className="font-black text-sm uppercase tracking-wide">Contact Information</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* SPOC Name */}
                    <div>
                      <label className="block font-bold text-slate-900 mb-1">SPOC Name (Contact Person) *</label>
                      <input
                        type="text"
                        name="spoc_name"
                        required
                        value={formData.spoc_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Arham Shah"
                        className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] transition-all font-semibold ${
                          touched.spoc_name && errors.spoc_name
                            ? 'border-red-500 bg-red-50/50'
                            : touched.spoc_name && !errors.spoc_name
                            ? 'border-emerald-500 bg-emerald-50/20'
                            : 'border-slate-300'
                        }`}
                      />
                      {touched.spoc_name && errors.spoc_name && (
                        <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-start gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                          <span>{errors.spoc_name}</span>
                        </p>
                      )}
                    </div>

                    {/* Mobile Number with Country Dial Code Selector */}
                    <div>
                      <label className="block font-bold text-slate-900 mb-1">
                        {formData.country === 'IN' ? 'Mobile Number *' : 'Contact / Mobile Number *'}
                      </label>
                      <div className="flex rounded-xl shadow-sm border border-slate-300 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-[#D48B1C] focus-within:border-[#D48B1C]">
                        <select
                          value={formData.country}
                          onChange={(e) => handleCountrySelect(e.target.value)}
                          className="bg-slate-100 hover:bg-slate-200 px-2.5 py-3 border-r border-slate-300 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                        >
                          {COUNTRY_OPTIONS.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.dialCode}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder={
                            formData.country === 'IN'
                              ? '9876543210'
                              : formData.country === 'AE'
                              ? '501234567'
                              : activeCountryConfig.phoneDigitsMsg
                          }
                          className={`w-full p-3 bg-transparent font-mono focus:outline-none transition-all ${
                            touched.phone && errors.phone
                              ? 'bg-red-50/50'
                              : touched.phone && !errors.phone
                              ? 'bg-emerald-50/20'
                              : ''
                          }`}
                        />
                      </div>
                      {touched.phone && errors.phone && (
                        <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-start gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>

                    {/* Email ID */}
                    <div>
                      <label className="block font-bold text-slate-900 mb-1">Email ID *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="vendor@domain.com"
                        className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] transition-all font-semibold ${
                          touched.email && errors.email
                            ? 'border-red-500 bg-red-50/50'
                            : touched.email && !errors.email
                            ? 'border-emerald-500 bg-emerald-50/20'
                            : 'border-slate-300'
                        }`}
                      />
                      {touched.email && errors.email && (
                        <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-start gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Min 6 characters"
                        className={`w-full p-3 pr-10 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] transition-all ${
                          touched.password && errors.password
                            ? 'border-red-500 bg-red-50/50'
                            : touched.password && !errors.password
                            ? 'border-emerald-500 bg-emerald-50/20'
                            : 'border-slate-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{errors.password}</span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3.5 bg-[#D48B1C] hover:bg-[#B87514] text-white font-black rounded-2xl shadow transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                >
                  <span>Next: Bank & Document Uploads</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STAGE 2: BANK ACCOUNT DETAILS & DOCUMENT UPLOADS */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-3 flex items-center gap-2 text-slate-800">
                  <CreditCard className="w-5 h-5 text-[#D48B1C]" />
                  <h3 className="font-black text-sm uppercase tracking-wide">
                    {formData.country === 'IN' ? 'Bank Account Details' : 'International Bank & Payout Details'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Bank Name */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Bank Name *</label>
                    <input
                      type="text"
                      name="bank_name"
                      required
                      value={formData.bank_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={formData.country === 'IN' ? 'e.g. HDFC Bank / ICICI Bank' : 'e.g. Emirates NBD / Chase / HSBC'}
                      className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] transition-all font-semibold ${
                        touched.bank_name && errors.bank_name
                          ? 'border-red-500 bg-red-50/50'
                          : touched.bank_name && !errors.bank_name
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-slate-300'
                      }`}
                    />
                    {touched.bank_name && errors.bank_name && (
                      <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{errors.bank_name}</span>
                      </p>
                    )}
                  </div>

                  {/* Bank Account Number */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">
                      {formData.country === 'IN' ? 'Account Number *' : 'Account Number / IBAN *'}
                    </label>
                    <input
                      type="text"
                      name="bank_account_number"
                      required
                      value={formData.bank_account_number}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={formData.country === 'IN' ? '50100012345678' : 'IBAN or Account Number'}
                      className={`w-full p-3 bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#D48B1C] transition-all ${
                        touched.bank_account_number && errors.bank_account_number
                          ? 'border-red-500 bg-red-50/50'
                          : touched.bank_account_number && !errors.bank_account_number
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-slate-300'
                      }`}
                    />
                    {touched.bank_account_number && errors.bank_account_number && (
                      <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{errors.bank_account_number}</span>
                      </p>
                    )}
                  </div>

                  {/* IFSC Code */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">
                      {formData.country === 'IN' ? 'IFSC Code *' : 'SWIFT / BIC Code *'}
                    </label>
                    <input
                      type="text"
                      name="bank_ifsc_code"
                      required
                      maxLength={11}
                      value={formData.bank_ifsc_code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={formData.country === 'IN' ? 'HDFC0001234' : 'SWIFT / BIC Code'}
                      className={`w-full p-3 bg-slate-50 border rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#D48B1C] transition-all ${
                        touched.bank_ifsc_code && errors.bank_ifsc_code
                          ? 'border-red-500 bg-red-50/50'
                          : touched.bank_ifsc_code && !errors.bank_ifsc_code
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-slate-300'
                      }`}
                    />
                    {touched.bank_ifsc_code && errors.bank_ifsc_code && (
                      <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{errors.bank_ifsc_code}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* DOCUMENT UPLOAD GUIDELINES BOX */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wide">
                    <Info className="w-4 h-4 text-[#D48B1C]" />
                    <span>Official KYC Document Upload Guide & Requirements</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-700">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                      <strong className="block text-slate-900 font-bold mb-0.5">
                        {formData.country === 'IN' ? '1. PAN Card Copy' : '1. Tax ID / Passport Proof'}
                      </strong>
                      {formData.country === 'IN'
                        ? 'Clear color photo or scanned copy of the registered business or proprietor PAN card.'
                        : 'Official scanned copy of National Tax ID, EIN, TRN certificate or Director Passport.'}
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                      <strong className="block text-slate-900 font-bold mb-0.5">
                        {formData.country === 'IN' ? '2. GST Certificate' : '2. Trade License / Reg'}
                      </strong>
                      {formData.country === 'IN'
                        ? 'Official GST REG-06 certificate displaying business legal name & GSTIN.'
                        : 'Official Commercial Registry, Certificate of Incorporation or Trade License.'}
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                      <strong className="block text-slate-900 font-bold mb-0.5">
                        {formData.country === 'IN' ? '3. Cancelled Cheque' : '3. Bank Statement / Mandate'}
                      </strong>
                      {formData.country === 'IN'
                        ? 'Bank verification document showing printed account name, account number & IFSC.'
                        : 'Official bank letter, statement header, or IBAN proof document.'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-amber-950 font-bold pt-1 border-t border-amber-200/60">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Accepted: JPG, PNG, WEBP, PDF (Max 5MB each). Documents are auto-compressed & saved directly to admin database.</span>
                  </div>
                </div>

                {/* DOCUMENT UPLOADS */}
                <div className="border-t border-slate-200 pt-5 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800">
                    <FileText className="w-5 h-5 text-[#D48B1C]" />
                    <h3 className="font-black text-sm uppercase tracking-wide">Upload Verification Documents</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* PAN CARD COPY */}
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 text-center space-y-3 hover:border-[#D48B1C] transition-all relative flex flex-col justify-between">
                      <div className="space-y-2">
                        {formData.pan_file ? (
                          <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-white relative group flex items-center justify-center">
                            {isPdfDocument(formData.pan_file) ? (
                              <div className="flex flex-col items-center justify-center p-2 text-center">
                                <FileText className="w-7 h-7 text-red-600 mb-1" />
                                <span className="text-[10px] font-black text-red-700 uppercase">PDF Document</span>
                              </div>
                            ) : (
                              <img src={formData.pan_file} alt="PAN Proof" className="w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                              Change File
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-[#D48B1C] flex items-center justify-center mx-auto">
                            <CreditCard className="w-5 h-5" />
                          </div>
                        )}
                        <div className="text-xs">
                          <span className="font-extrabold text-slate-900 block">1. PAN Card Proof *</span>
                          <span className="text-slate-500 text-[10px]">JPG, PNG, PDF &bull; Max 5MB</span>
                        </div>
                      </div>

                      <input
                        type="file"
                        accept="image/*,application/pdf,.pdf"
                        onChange={(e) => handleFileUpload(e, 'pan_file')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />

                      {panFileName ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold rounded-lg border border-emerald-300">
                            ✓ {panFileName.substring(0, 15)}... {panFileSize && `(${panFileSize})`}
                          </span>
                        </div>
                      ) : (
                        <button type="button" className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-bold border border-slate-300 shadow-sm pointer-events-none">
                          Browse / Upload
                        </button>
                      )}
                    </div>

                    {/* GST CERTIFICATE */}
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 text-center space-y-3 hover:border-[#D48B1C] transition-all relative flex flex-col justify-between">
                      <div className="space-y-2">
                        {formData.gst_file ? (
                          <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-white relative group flex items-center justify-center">
                            {isPdfDocument(formData.gst_file) ? (
                              <div className="flex flex-col items-center justify-center p-2 text-center">
                                <FileText className="w-7 h-7 text-red-600 mb-1" />
                                <span className="text-[10px] font-black text-red-700 uppercase">PDF Document</span>
                              </div>
                            ) : (
                              <img src={formData.gst_file} alt="GST Proof" className="w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                              Change File
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-[#D48B1C] flex items-center justify-center mx-auto">
                            <Building2 className="w-5 h-5" />
                          </div>
                        )}
                        <div className="text-xs">
                          <span className="font-extrabold text-slate-900 block">2. GST Certificate *</span>
                          <span className="text-slate-500 text-[10px]">GST REG-06 &bull; Max 5MB</span>
                        </div>
                      </div>

                      <input
                        type="file"
                        accept="image/*,application/pdf,.pdf"
                        onChange={(e) => handleFileUpload(e, 'gst_file')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />

                      {gstFileName ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold rounded-lg border border-emerald-300">
                            ✓ {gstFileName.substring(0, 15)}... {gstFileSize && `(${gstFileSize})`}
                          </span>
                        </div>
                      ) : (
                        <button type="button" className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-bold border border-slate-300 shadow-sm pointer-events-none">
                          Browse / Upload
                        </button>
                      )}
                    </div>

                    {/* CANCELLED CHEQUE */}
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 text-center space-y-3 hover:border-[#D48B1C] transition-all relative flex flex-col justify-between">
                      <div className="space-y-2">
                        {formData.cheque_file ? (
                          <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-white relative group flex items-center justify-center">
                            {isPdfDocument(formData.cheque_file) ? (
                              <div className="flex flex-col items-center justify-center p-2 text-center">
                                <FileText className="w-7 h-7 text-red-600 mb-1" />
                                <span className="text-[10px] font-black text-red-700 uppercase">PDF Document</span>
                              </div>
                            ) : (
                              <img src={formData.cheque_file} alt="Cheque Proof" className="w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                              Change File
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-[#D48B1C] flex items-center justify-center mx-auto">
                            <CreditCard className="w-5 h-5" />
                          </div>
                        )}
                        <div className="text-xs">
                          <span className="font-extrabold text-slate-900 block">3. Cancelled Cheque *</span>
                          <span className="text-slate-500 text-[10px]">Passbook / Cheque &bull; Max 5MB</span>
                        </div>
                      </div>

                      <input
                        type="file"
                        accept="image/*,application/pdf,.pdf"
                        onChange={(e) => handleFileUpload(e, 'cheque_file')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />

                      {chequeFileName ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold rounded-lg border border-emerald-300">
                            ✓ {chequeFileName.substring(0, 15)}... {chequeFileSize && `(${chequeFileSize})`}
                          </span>
                        </div>
                      ) : (
                        <button type="button" className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-bold border border-slate-300 shadow-sm pointer-events-none">
                          Browse / Upload
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-2/3 py-3.5 bg-[#D48B1C] hover:bg-[#B87514] text-white font-black rounded-2xl shadow transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                  >
                    <span>Next: Terms & Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 3: TERMS & CONDITIONS ACCEPTANCE & FINAL REVIEW */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-3 flex items-center gap-2 text-slate-800">
                  <ShieldCheck className="w-5 h-5 text-[#D48B1C]" />
                  <h3 className="font-black text-sm uppercase tracking-wide">Review Summary & Terms</h3>
                </div>

                {/* SUMMARY PREVIEW CARD */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Vendor Name</span>
                      <span className="font-extrabold text-slate-900">{formData.vendor_name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Entity Type</span>
                      <span className="font-extrabold text-slate-900">{formData.entity_type}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">GST Number</span>
                      <span className="font-mono font-extrabold text-[#D48B1C]">{formData.gst_number}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">PAN Number</span>
                      <span className="font-mono font-extrabold text-slate-900">{formData.pan_number}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">SPOC / Contact Person</span>
                      <span className="font-extrabold text-slate-900">{formData.spoc_name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Mobile & Email</span>
                      <span className="font-extrabold text-slate-900 block">{formData.phone}</span>
                      <span className="text-slate-500 text-[10px]">{formData.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Name</span>
                      <span className="font-extrabold text-slate-900">{formData.bank_name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Account & IFSC</span>
                      <span className="font-mono font-extrabold text-slate-900 block">{formData.bank_account_number}</span>
                      <span className="font-mono text-slate-500 text-[10px]">{formData.bank_ifsc_code}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Location</span>
                      <span className="font-extrabold text-slate-900">{formData.city}, {formData.state}</span>
                    </div>
                  </div>

                  {/* Document Upload Status Bar */}
                  <div className="pt-3 border-t border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Uploaded Verification Proofs</span>
                    <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> PAN Card Attached
                      </span>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> GST Certificate Attached
                      </span>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Cancelled Cheque Attached
                      </span>
                    </div>
                  </div>
                </div>

                {/* TERMS & CONDITIONS CHECKBOX */}
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked);
                        if (e.target.checked) setTermsError(null);
                      }}
                      className="mt-1 w-4 h-4 text-[#D48B1C] rounded border-slate-300 focus:ring-[#D48B1C]"
                    />
                    <div className="text-xs text-slate-800 space-y-1">
                      <span className="font-extrabold text-slate-900 block">Accept Terms & Conditions *</span>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        I hereby declare that all business vendor information, including GSTIN ({formData.gst_number || 'N/A'}) and Bank details, provided above is true and authentic. I agree to abide by SalvageReef Tender Bidding Rules, EMD policies, and General Conditions of Sale.
                      </p>
                    </div>
                  </label>
                  {termsError && <p className="text-xs text-red-600 font-extrabold pl-7">{termsError}</p>}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !termsAccepted}
                    className="w-2/3 py-3.5 bg-[#D48B1C] hover:bg-[#B87514] text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Complete Registration</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="text-[#D48B1C] font-bold hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
