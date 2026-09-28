import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ClassifiedCard from '../components/ClassifiedCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { Tag, Search, Filter } from 'lucide-react';
import { Classified } from '../types';
import { INITIAL_CLASSIFIEDS } from '../services/mockService';
import { useCategoryLocationStore } from '../store/useCategoryLocationStore';

import SEOHead from '../components/SEOHead';

export default function Classifieds() {
  const { categories, locations, setCategories } = useCategoryLocationStore();
  const [classifieds, setClassifieds] = useState<Classified[]>(() => {
    try {
      const stored = localStorage.getItem('sr_classifieds');
      return stored ? JSON.parse(stored) : INITIAL_CLASSIFIEDS;
    } catch {
      return INITIAL_CLASSIFIEDS;
    }
  });
  const [loading, setLoading] = useState<boolean>(false);

  const [category, setCategory] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const fetchClassifieds = async () => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category_id', category);
      if (location) params.append('location', location);
      if (search) params.append('search', search);

      const [res, catRes] = await Promise.all([
        api.get(`/classifieds?${params.toString()}`),
        api.get('/categories'),
      ]);

      if (res.data?.data && Array.isArray(res.data.data)) {
        setClassifieds(res.data.data);
        if (!category && !location && !search) {
          try { localStorage.setItem('sr_classifieds', JSON.stringify(res.data.data)); } catch {}
        }
      } else if (Array.isArray(res.data)) {
        setClassifieds(res.data);
        if (!category && !location && !search) {
          try { localStorage.setItem('sr_classifieds', JSON.stringify(res.data)); } catch {}
        }
      }
      if (catRes.data && Array.isArray(catRes.data)) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Error fetching classifieds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassifieds();
  }, [category, location]);

  // Real-time synchronization for classifieds
  useEffect(() => {
    let unsub: any = null;
    import('../services/realtimeSync').then(({ subscribeRealtimeEvents }) => {
      unsub = subscribeRealtimeEvents((event) => {
        if (
          event.type === 'classified_created' ||
          event.type === 'classified_updated' ||
          event.type === 'classified_deleted'
        ) {
          fetchClassifieds();
        }
      });
    });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sr_classifieds' && e.newValue) {
        try {
          setClassifieds(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (unsub) unsub();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClassifieds();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SEOHead
        title="Industrial Equipment & Scrap Metal Classifieds"
        description="Direct buy & sell listings for second-hand tools, scrap machinery, electrical motors, and industrial plant surplus in India."
        keywords="scrap machinery classifieds, buy scrap lathe machine, industrial equipment sale Mumbai, brass shell scrap marketplace"
      />
      {/* Page Header */}
      <div className="bg-[#0B192C] text-white p-8 rounded-3xl border-b-4 border-[#D48B1C] shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[#D48B1C] text-xs font-bold uppercase tracking-wider block mb-1">
            SalvageReef Direct Classifieds
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <Tag className="w-7 h-7 text-[#D48B1C]" /> Scrap Machinery & Materials
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            Direct buyer-seller listings with instant contact details.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#D48B1C]" /> Filter Listings
            </h3>
          </div>

          <form onSubmit={handleSearchSubmit}>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Search Keywords</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Lathe, Motor, Copper..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </form>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C]"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D48B1C] font-semibold"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.city}>
                  {loc.city}{loc.state ? `, ${loc.state}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Listings */}
        <div className="lg:col-span-3">
          {loading ? (
            <SkeletonLoader count={6} />
          ) : classifieds.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              No classified listings found matching parameters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {classifieds.map((cl) => (
                <ClassifiedCard key={cl.id} classified={cl} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
