<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Auction;
use App\Models\EnquiryOrInterest;
use Illuminate\Http\Request;

class InterestController extends Controller
{
    public function store(Request $request, $auction_id)
    {
        $user = $request->user();

        $auction = Auction::findOrFail($auction_id);

        $existing = EnquiryOrInterest::where('auction_id', $auction->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Interest already submitted. Status: ' . $existing->status,
                'interest' => $existing,
            ]);
        }

        $interest = EnquiryOrInterest::create([
            'auction_id' => $auction->id,
            'user_id' => $user->id,
            'message' => $request->input('message', 'Requesting access to bid on private auction.'),
            'status' => 'pending',
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Interest submitted successfully! Pending approval by admin.',
            'interest' => $interest,
        ], 201);
    }
}
