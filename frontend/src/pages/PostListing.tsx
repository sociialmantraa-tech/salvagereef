import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../services/api';
import { Tag, PlusCircle, AlertCircle, RefreshCw } from 'lucide-react';
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
  image_url: z.string().url('Must be a valid image URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function PostListing() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

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
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    },
  });

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(console.error);
  }, []);

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await api.post('/classifieds/post-listing', data);
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
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
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
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sample Image URL</label>
            <input
              type="text"
              {...register('image_url')}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
            />
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
            disabled={submitting}
            className="w-full py-3.5 bg-[#D48B1C] hover:bg-[#B87514] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />} Publish Scrap Listing
          </button>
        </form>
      </div>
    </div>
  );
}
