import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Gavel, Users, Clock, ShieldAlert, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_auctions_live: 0,
    total_bids_today: 0,
    new_users_this_week: 0,
    pending_approvals: 0,
  });
  const [needingAttention, setNeedingAttention] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAdminStats = async () => {
    try {
      const res = await api.get('/admin/dashboard/stats');
      setStats(res.data.stats);
      setNeedingAttention(res.data.needing_attention || []);
    } catch (err) {
      console.error('Error loading admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleApproveInterest = async (interestId: number, newStatus: string) => {
    try {
      await api.put(`/admin/interests/${interestId}/approve`, { status: newStatus });
      fetchAdminStats();
    } catch (err) {
      alert('Failed to update interest status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-[#D48B1C] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0B192C] text-white p-6 sm:p-8 rounded-3xl border-b-4 border-[#D48B1C] shadow-lg flex justify-between items-center">
        <div>
          <span className="text-[#D48B1C] text-xs font-bold uppercase tracking-wider block mb-1">
            SalvageReef Management Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Admin Control Desk</h1>
          <p className="text-xs text-slate-300 mt-1">Platform overview & pending tender access approvals</p>
        </div>

        <Link
          to="/auctions"
          className="hidden sm:flex items-center gap-2 bg-[#D48B1C] hover:bg-[#B87514] text-white font-bold px-4 py-2 rounded-xl text-xs shadow"
        >
          <Gavel className="w-4 h-4" /> Live Auctions Desk
        </Link>
      </div>

      {/* Top 4 Stat Cards MAX */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Auctions Live</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.total_auctions_live}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <Gavel className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Total Bids Today</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.total_bids_today}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D48B1C] border border-amber-200 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">New Users (Week)</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.new_users_this_week}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Pending Approvals</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.pending_approvals}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Single Table: Auctions Needing Attention */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#D48B1C]" /> Auctions Needing Attention
          </h3>
          <span className="text-xs text-slate-400">Ending soon or pending tender access requests</span>
        </div>

        {needingAttention.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center italic">
            No auctions currently need urgent attention. Everything is running smoothly!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="p-3">Auction Lot</th>
                  <th className="p-3">Tender Type</th>
                  <th className="p-3">Highest Bid</th>
                  <th className="p-3">End Time</th>
                  <th className="p-3">Pending Requests</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {needingAttention.map((auc) => (
                  <tr key={auc.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">
                      <Link to={`/auctions/${auc.slug}`} className="hover:text-[#D48B1C] flex items-center gap-1">
                        {auc.title} <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                    <td className="p-3">
                      <span className="capitalize font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {auc.auction_type}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      ₹{Number(auc.current_highest_bid || auc.starting_price).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-slate-500 font-mono">
                      {new Date(auc.end_time).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      {auc.interests && auc.interests.length > 0 ? (
                        <div className="space-y-1">
                          {auc.interests.map((req: any) => (
                            <div key={req.id} className="flex items-center gap-2 bg-purple-50 p-1.5 rounded border border-purple-200">
                              <span className="font-semibold text-purple-900">{req.user?.name}</span>
                              <div className="flex gap-1 ml-auto">
                                <button
                                  onClick={() => handleApproveInterest(req.id, 'approved')}
                                  className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700"
                                  title="Approve Interest"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleApproveInterest(req.id, 'rejected')}
                                  className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                                  title="Reject Interest"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/auctions/${auc.slug}`}
                        className="px-3 py-1 bg-[#0B192C] text-white font-bold rounded-lg hover:bg-[#D48B1C] transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
