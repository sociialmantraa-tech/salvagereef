<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\BidPlaced;
use App\Http\Controllers\Controller;
use App\Models\Auction;
use App\Models\Bid;
use App\Models\EnquiryOrInterest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuctionController extends Controller
{
    public function index(Request $request)
    {
        $query = Auction::with(['category', 'primaryImage', 'creator']);

        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('auction_type') && $request->auction_type) {
            $query->where('auction_type', $request->auction_type);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('location') && $request->location) {
            $query->where(function ($q) use ($request) {
                $q->where('location_city', 'like', '%' . $request->location . '%')
                  ->orWhere('location_state', 'like', '%' . $request->location . '%');
            });
        }

        if ($request->has('search') && $request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $auctions = $query->orderBy('created_at', 'desc')->paginate(12);

        return response()->json($auctions);
    }

    public function show(Request $request, $slug)
    {
        $auction = Auction::with([
            'category',
            'images',
            'creator',
            'bids' => function ($q) {
                $q->with('user:id,name')->orderBy('amount', 'desc')->take(10);
            },
            'groupChildren' => function ($q) {
                $q->with('primaryImage');
            }
        ])->where('slug', $slug)->orWhere('id', $slug)->firstOrFail();

        $user = $request->user('sanctum');

        $isUnlocked = true;
        if ($auction->auction_type === 'private') {
            if (!$user) {
                $isUnlocked = false;
            } elseif ($user->id !== $auction->created_by && !$user->isAdmin()) {
                $hasInterest = EnquiryOrInterest::where('auction_id', $auction->id)
                    ->where('user_id', $user->id)
                    ->where('status', 'approved')
                    ->exists();

                if (!$hasInterest) {
                    $isUnlocked = false;
                }
            }
        }

        return response()->json([
            'auction' => $auction,
            'is_unlocked' => $isUnlocked,
            'server_time' => Carbon::now()->toIso8601String(),
        ]);
    }

    public function placeBid(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric|gt:0',
        ]);

        $user = $request->user();
        $bidAmount = (float) $request->amount;

        return DB::transaction(function () use ($id, $user, $bidAmount) {
            // Lock auction row for update to eliminate race conditions
            $auction = Auction::where('id', $id)->lockForUpdate()->firstOrFail();

            if ($auction->status !== 'live') {
                return response()->json([
                    'message' => 'Bidding is disabled because this auction is not currently live.'
                ], 422);
            }

            if (Carbon::now()->greaterThanOrEqualTo($auction->end_time)) {
                $auction->status = 'closed';
                $auction->save();

                return response()->json([
                    'message' => 'This auction has ended.'
                ], 422);
            }

            if ($user->id === $auction->created_by) {
                return response()->json([
                    'message' => 'You cannot bid on your own auction.'
                ], 422);
            }

            $currentHighest = $auction->current_highest_bid ?? $auction->starting_price;

            if ($bidAmount <= $currentHighest) {
                return response()->json([
                    'message' => "Your bid must be strictly higher than the current highest bid of ₹" . number_format($currentHighest, 2)
                ], 422);
            }

            // Dynamic Anti-Sniping Rule: If bid placed in final minutes (<= 120 seconds), extend end_time by +2 minutes (120s)
            $now = Carbon::now();
            $endTime = Carbon::parse($auction->end_time);
            $remainingSeconds = $endTime->diffInSeconds($now, false) * -1;
            $timeExtended = false;
            $newEndTime = $auction->end_time;

            if ($remainingSeconds > 0 && $remainingSeconds <= 120) {
                $timeExtended = true;
                $newEndTime = max($endTime->copy()->addMinutes(2), $now->copy()->addMinutes(2));
                $auction->end_time = $newEndTime;
            }

            // Check if user already has an approved bid on this specific auction lot
            $hasApprovedBid = Bid::where('auction_id', $auction->id)
                ->where('user_id', $user->id)
                ->where('status', 'approved')
                ->exists();

            $isFirstBid = !$hasApprovedBid;
            $bidStatus = $isFirstBid ? 'pending' : 'approved';

            // Create bid
            $bid = Bid::create([
                'auction_id' => $auction->id,
                'user_id' => $user->id,
                'amount' => $bidAmount,
                'status' => $bidStatus,
                'created_at' => Carbon::now(),
            ]);

            if ($bidStatus === 'approved') {
                $auction->current_highest_bid = $bidAmount;
            }
            $auction->save();

            // Broadcast BidPlaced event
            event(new BidPlaced($auction->id, $bidAmount, $user->name, $bid->created_at->toIso8601String()));

            if ($isFirstBid) {
                return response()->json([
                    'success' => true,
                    'status' => 'pending',
                    'requires_admin_approval' => true,
                    'is_first_bid' => true,
                    'time_extended' => $timeExtended,
                    'new_end_time' => $newEndTime,
                    'extension_seconds' => 120,
                    'message' => $timeExtended
                        ? 'Your initial bid has been submitted for Admin Approval. Dynamic anti-sniping: auction timer extended by +2 minutes!'
                        : 'Your initial bid has been submitted for Admin Approval. Once accepted, you can freely increase your bid on this lot!',
                    'bid' => [
                        'id' => $bid->id,
                        'amount' => $bidAmount,
                        'status' => 'pending',
                        'bidder_name' => $user->name,
                        'created_at' => $bid->created_at->toIso8601String(),
                    ],
                ]);
            }

            return response()->json([
                'success' => true,
                'status' => 'approved',
                'requires_admin_approval' => false,
                'is_first_bid' => false,
                'time_extended' => $timeExtended,
                'new_end_time' => $newEndTime,
                'extension_seconds' => 120,
                'message' => $timeExtended
                    ? 'Bid placed successfully! Bidding time extended by +2 minutes (Anti-Sniping Rule).'
                    : 'Bid placed successfully!',
                'bid' => [
                    'id' => $bid->id,
                    'amount' => $bidAmount,
                    'status' => 'approved',
                    'bidder_name' => $user->name,
                    'created_at' => $bid->created_at->toIso8601String(),
                ],
                'current_highest_bid' => $bidAmount,
            ]);
        });
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'auction_type' => 'required|in:public,private,group',
            'quantity' => 'required|numeric|gt:0',
            'unit' => 'required|string|max:50',
            'starting_price' => 'required|numeric|gte:0',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'location_city' => 'required|string|max:100',
            'location_state' => 'required|string|max:100',
            'is_group' => 'nullable|boolean',
            'group_id' => 'nullable|exists:auctions,id',
            'image_url' => 'nullable|string',
        ]);

        $slug = Str::slug($validated['title']) . '-' . Str::random(5);

        $now = Carbon::now();
        $startTime = Carbon::parse($validated['start_time']);
        $endTime = Carbon::parse($validated['end_time']);

        $status = 'upcoming';
        if ($now->gte($startTime) && $now->lt($endTime)) {
            $status = 'live';
        } elseif ($now->gte($endTime)) {
            $status = 'closed';
        }

        $auction = Auction::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'description' => $validated['description'],
            'category_id' => $validated['category_id'],
            'auction_type' => $validated['auction_type'],
            'status' => $status,
            'quantity' => $validated['quantity'],
            'unit' => $validated['unit'],
            'starting_price' => $validated['starting_price'],
            'current_highest_bid' => null,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'location_city' => $validated['location_city'],
            'location_state' => $validated['location_state'],
            'is_group' => $validated['is_group'] ?? false,
            'group_id' => $validated['group_id'] ?? null,
            'created_by' => $user->id,
        ]);

        if (!empty($validated['image_url'])) {
            $auction->images()->create([
                'image_path' => $validated['image_url'],
                'is_primary' => true,
            ]);
        }

        return response()->json($auction, 201);
    }
}
