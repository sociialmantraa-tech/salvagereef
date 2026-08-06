<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuctionClosed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $auction_id;
    public $winning_bid;
    public $winner_name;

    public function __construct($auction_id, $winning_bid = null, $winner_name = null)
    {
        $this->auction_id = $auction_id;
        $this->winning_bid = $winning_bid ? (float) $winning_bid : null;
        $this->winner_name = $winner_name;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('auction.' . $this->auction_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'AuctionClosed';
    }

    public function broadcastWith(): array
    {
        return [
            'auction_id' => $this->auction_id,
            'winning_bid' => $this->winning_bid,
            'winner_name' => $this->winner_name,
        ];
    }
}
