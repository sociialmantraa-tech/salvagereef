<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Auction;
use App\Models\Bid;
use App\Models\Classified;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();

        // 1. User Bids with Auction info
        $userBids = Bid::with('auction')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate 3 stats max
        $activeBidsCount = $userBids->pluck('auction_id')->unique()->count();

        // Auctions won: closed auctions where user placed highest bid
        $userBidAuctionIds = $userBids->pluck('auction_id')->unique();
        $auctionsWonCount = 0;

        $recentBidsList = [];
        foreach ($userBids->take(15) as $bid) {
            $auction = $bid->auction;
            $status = 'active';

            if ($auction) {
                if ($auction->status === 'closed') {
                    if ($auction->current_highest_bid == $bid->amount) {
                        $status = 'won';
                        $auctionsWonCount++;
                    } else {
                        $status = 'lost';
                    }
                } else {
                    if ($auction->current_highest_bid == $bid->amount) {
                        $status = 'winning';
                    } else {
                        $status = 'outbid';
                    }
                }
            }

            $recentBidsList[] = [
                'id' => $bid->id,
                'auction_id' => $bid->auction_id,
                'auction_title' => $auction ? $auction->title : 'Unknown Auction',
                'auction_slug' => $auction ? $auction->slug : '',
                'bid_amount' => $bid->amount,
                'current_highest_bid' => $auction ? $auction->current_highest_bid : $bid->amount,
                'auction_status' => $auction ? $auction->status : 'closed',
                'my_status' => $status,
                'created_at' => $bid->created_at,
            ];
        }

        // My classified listings
        $myClassifieds = Classified::where('created_by', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'stats' => [
                'active_bids' => $activeBidsCount,
                'auctions_won' => $auctionsWonCount,
                'watchlist_count' => count($recentBidsList) > 0 ? count($recentBidsList) : 0,
            ],
            'recent_bids' => $recentBidsList,
            'my_listings' => $myClassifieds,
        ]);
    }

    public function userBids(Request $request)
    {
        $bids = Bid::with('auction')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($bids);
    }

    public function userAuctions(Request $request)
    {
        $auctions = Auction::where('created_by', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($auctions);
    }
}
