<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Auction;
use App\Models\Bid;
use App\Models\Classified;
use App\Models\EnquiryOrInterest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function stats()
    {
        $today = Carbon::today();
        $weekAgo = Carbon::now()->subDays(7);

        $stats = [
            'total_auctions_live' => Auction::where('status', 'live')->count(),
            'total_auctions' => Auction::count(),
            'total_bids_today' => Bid::where('created_at', '>=', $today)->count(),
            'new_users_this_week' => User::where('created_at', '>=', $weekAgo)->count(),
            'pending_approvals' => EnquiryOrInterest::where('status', 'pending')->count(),
            'total_registered_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'suspended_users' => User::where('is_active', false)->count(),
            'kyc_verified_users' => User::where('is_verified', true)->count(),
            'total_classifieds' => Classified::count(),
            'total_bids' => Bid::count(),
        ];

        // Auctions needing attention (ending soon or pending interest requests)
        $needingAttention = Auction::with(['category', 'creator', 'interests' => function ($q) {
            $q->where('status', 'pending')->with('user');
        }])
        ->where(function ($q) use ($today) {
            $q->where('status', 'live')
              ->where('end_time', '<=', Carbon::now()->addHours(24))
              ->orWhereHas('interests', function ($iq) {
                  $iq->where('status', 'pending');
              });
        })
        ->orderBy('end_time', 'asc')
        ->limit(10)
        ->get();

        return response()->json([
            'stats' => $stats,
            'needing_attention' => $needingAttention,
        ]);
    }

    public function users()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json([
            'data' => $users,
            'total' => $users->count(),
            'active' => $users->where('is_active', true)->count(),
            'suspended' => $users->where('is_active', false)->count(),
            'verified' => $users->where('is_verified', true)->count(),
        ]);
    }

    public function verifyUser($id)
    {
        $user = User::findOrFail($id);
        $user->is_verified = !$user->is_verified;
        $user->save();

        return response()->json([
            'message' => 'User KYC verification status updated to ' . ($user->is_verified ? 'Verified' : 'Unverified'),
            'user' => $user,
        ]);
    }

    public function toggleUserActive($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json([
            'message' => 'User account status updated to ' . ($user->is_active ? 'Active' : 'Suspended'),
            'user' => $user,
        ]);
    }

    public function updateUserRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:admin,agent,bidder',
        ]);

        $user = User::findOrFail($id);
        $user->role = $request->role;
        $user->save();

        return response()->json([
            'message' => 'User role updated to ' . strtoupper($user->role),
            'user' => $user,
        ]);
    }

    public function allAuctions()
    {
        $auctions = Auction::with(['category', 'creator'])
            ->withCount(['bids', 'interests'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($auctions);
    }

    public function allClassifieds()
    {
        $classifieds = Classified::with(['category', 'creator'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($classifieds);
    }

    public function allInterests()
    {
        $interests = EnquiryOrInterest::with(['auction', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($interests);
    }

    public function approveInterest(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $interest = EnquiryOrInterest::findOrFail($id);
        $interest->status = $request->status;
        $interest->save();

        return response()->json([
            'message' => 'Tender access request ' . $request->status,
            'interest' => $interest,
        ]);
    }

    public function deleteAuction($id)
    {
        $auction = Auction::findOrFail($id);
        $auction->delete();

        return response()->json(['message' => 'Auction lot deleted successfully']);
    }

    public function deleteClassified($id)
    {
        $classified = Classified::findOrFail($id);
        $classified->delete();

        return response()->json(['message' => 'Classified listing deleted successfully']);
    }
}
