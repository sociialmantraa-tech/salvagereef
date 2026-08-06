import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../services/api';
import { compressAndSanitizeImage, CompressionResult } from '../utils/imageCompressor';
import { Tag, PlusCircle, AlertCircle, RefreshCw, UploadCloud, Image as ImageIcon, ShieldCheck, CheckCircle2, Info, Check, XCircle, Lock } from 'lucide-react';
import { Category } from '../types';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(15, 'Description must be at least 15 characters'),
  category_id: z.string().min(1, 'Please select a category'),
  price: z.coerce.number().positive('Price must be a positive number'),
  quantity: z.coerce.number().positive('Quantity must be a positive number'),
  unit: z.string().min(1, 'Unit is required'),
  location_city: z.string().min(2, 'City is required'),
  location_state: z.string().min(2, 'State is required'),
});

type FormData = z.infer<typeof schema>;

export default function PostListing() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Image Upload State
  const [compressedImage, setCompressedImage] = useState<CompressionResult | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      unit: 'nos',
      location_city: 'Thane',
      location_state: 'Maharashtra',
    },
  });

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(console.error);
  }, []);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    setCompressing(true);
    try {
      const result = await compressAndSanitizeImage(file, 1200, 900, 0.82);
      setCompressedImage(result);
    } catch (err: any) {
      setImageError(err.message || 'Image processing failed');
      setCompressedImage(null);
    } finally {
      setCompressing(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        image_url: compressedImage ? compressedImage.dataUrl : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      };
      const res = await api.post('/classifieds/post-listing', payload);
      navigate(`/classifieds/${res.data.slug}`);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to create classified listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-[#0B192C] text-white p-6 rounded-3xl border-b-4 border-[#D48B1C] shadow-lg flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#D48B1C]/20 text-[#D48B1C] flex items-center justify-center font-bold">
          <PlusCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Post Scrap Classified Listing</h1>
          <p className="text-xs text-slate-300">Sell scrap machinery, metals, or assets directly to verified buyers</p>
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
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Listing Title *</label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Heavy Duty Lathe Machine 10 Feet Bed"
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-bold"
            />
            {errors.title && <p className="text-red-500 text-[11px] mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                {...register('category_id')}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-[11px] mt-1">{errors.category_id.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Asking Price (₹) *</label>
              <input
                type="number"
                {...register('price')}
                placeholder="175000"
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
                placeholder="1"
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
              />
              {errors.quantity && <p className="text-red-500 text-[11px] mt-1">{errors.quantity.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit *</label>
              <input
                type="text"
                {...register('unit')}
                placeholder="nos, MT, kg, lot"
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
              />
              {errors.unit && <p className="text-red-500 text-[11px] mt-1">{errors.unit.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                {...register('location_city')}
                placeholder="Thane"
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
              />
              {errors.location_city && <p className="text-red-500 text-[11px] mt-1">{errors.location_city.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                {...register('location_state')}
                placeholder="Maharashtra"
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
              />
              {errors.location_state && <p className="text-red-500 text-[11px] mt-1">{errors.location_state.message}</p>}
            </div>
          </div>

          {/* SECURE HIGH-PERFORMANCE WEBP IMAGE UPLOAD SECTION */}
          <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="block text-slate-900 font-extrabold text-xs flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" /> Secure Product Photo Upload
              </label>
              <span className="text-[10px] text-emerald-800 font-black bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Auto Canvas Sanitized & WebP Compressed
              </span>
            </div>

            {/* Guidance Specs */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-2 font-medium">
              <div className="flex items-center gap-1.5 text-slate-900">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span><strong>Recommended Res:</strong> 1200 x 800 px</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Max Size:</strong> 10 MB (Auto WebP)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D48B1C] shrink-0" />
                <span><strong>Format:</strong> WebP, JPG, PNG, GIF</span>
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
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              {compressing ? (
                <div className="space-y-2 py-4">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Compressing photo to WebP format & checking security...</p>
                </div>
              ) : compressedImage ? (
                <div className="space-y-3">
                  <div className="w-44 h-32 mx-auto rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md relative group">
                    <img src={compressedImage.dataUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-1 shadow">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-slate-900 text-white text-[11px] px-4 py-2 rounded-xl font-mono shadow">
                    <span>Name: {compressedImage.fileName}</span>
                    <span>&bull;</span>
                    <span>Raw: <span className="text-red-300 font-bold">{compressedImage.originalSizeStr}</span></span>
                    <span>&bull;</span>
                    <span>WebP: <span className="text-emerald-400 font-black">{compressedImage.compressedSizeStr}</span></span>
                    <span>&bull;</span>
                    <span>Size: <span className="text-amber-300 font-bold">{compressedImage.width} x {compressedImage.height} px</span></span>
                  </div>

                  <p className="text-[10px] text-slate-400 block font-sans">Click or drag a new photo to replace.</p>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-emerald-600 mx-auto transition-colors" />
                  <p className="text-xs font-bold text-slate-800">Click or Drag & Drop Product Photo Here</p>
                  <p className="text-[10px] text-slate-400">Supports high-res JPG, PNG, WEBP & GIF. Auto-converted to low-storage WebP.</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Description *</label>
            <textarea
              rows={4}
              {...register('description')}
              placeholder="Describe machine condition, scrap quality, inspection availability..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
            ></textarea>
            {errors.description && <p className="text-red-500 text-[11px] mt-1">{errors.description.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting || compressing}
            className="w-full py-3.5 bg-[#D48B1C] hover:bg-[#B87514] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />} Publish Scrap Listing
          </button>
        </form>
      </div>
    </div>
  );
}
