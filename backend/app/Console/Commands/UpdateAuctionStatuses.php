<?php

namespace App\Console\Commands;

use App\Events\AuctionClosed;
use App\Models\Auction;
use Carbon\Carbon;
use Illuminate\Console\Command;

class UpdateAuctionStatuses extends Command
{
    protected $signature = 'auctions:update-statuses';
    protected $description = 'Automatically transition auction statuses based on start_time and end_time';

    public function handle()
    {
        $now = Carbon::now();

        // 1. Transition Upcoming -> Live
        $startedCount = Auction::where('status', 'upcoming')
            ->where('start_time', '<=', $now)
            ->update(['status' => 'live']);

        // 2. Find Live auctions that reached end_time
        $closingAuctions = Auction::where('status', 'live')
            ->where('end_time', '<=', $now)
            ->get();

        foreach ($closingAuctions as $auction) {
            $auction->status = 'closed';
            $auction->save();

            $highestBid = $auction->bids()->orderBy('amount', 'desc')->first();
            $winningAmount = $highestBid ? $highestBid->amount : null;
            $winnerName = $highestBid && $highestBid->user ? $highestBid->user->name : null;

            event(new AuctionClosed($auction->id, $winningAmount, $winnerName));
        }

        $this->info("Updated auction statuses. Started: {$startedCount}, Closed: " . count($closingAuctions));
    }
}
