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

        // Strict 4 stats max per requirements
        $stats = [
            'total_auctions_live' => Auction::where('status', 'live')->count(),
            'total_bids_today' => Bid::where('created_at', '>=', $today)->count(),
            'new_users_this_week' => User::where('created_at', '>=', $weekAgo)->count(),
            'pending_approvals' => EnquiryOrInterest::where('status', 'pending')->count(),
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
        $users = User::orderBy('created_at', 'desc')->paginate(20);
        return response()->json($users);
    }

    public function verifyUser($id)
    {
        $user = User::findOrFail($id);
        $user->is_verified = ! $user->is_verified;
        $user->save();

        return response()->json([
            'message' => 'User verification status updated',
            'user' => $user,
        ]);
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
            'message' => 'Interest status updated to ' . $request->status,
            'interest' => $interest,
        ]);
    }

    public function deleteAuction($id)
    {
        $auction = Auction::findOrFail($id);
        $auction->delete();

        return response()->json(['message' => 'Auction deleted successfully']);
    }

    public function deleteClassified($id)
    {
        $classified = Classified::findOrFail($id);
        $classified->delete();

        return response()->json(['message' => 'Classified deleted successfully']);
    }
}
