import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
}

export default function SkeletonLoader({ count = 6 }: SkeletonLoaderProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
          <div className="bg-slate-200 h-44 rounded-xl w-full"></div>
          <div className="space-y-2">
            <div className="bg-slate-200 h-4 rounded w-1/3"></div>
            <div className="bg-slate-200 h-5 rounded w-3/4"></div>
            <div className="bg-slate-200 h-3 rounded w-full"></div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
            <div className="bg-slate-200 h-6 rounded w-1/3"></div>
            <div className="bg-slate-200 h-8 rounded-xl w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
