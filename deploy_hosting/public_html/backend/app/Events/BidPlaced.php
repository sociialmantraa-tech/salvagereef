<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BidPlaced implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $auction_id;
    public $amount;
    public $bidder_name;
    public $created_at;

    public function __construct($auction_id, $amount, $bidder_name, $created_at)
    {
        $this->auction_id = $auction_id;
        $this->amount = (float) $amount;
        $this->bidder_name = $bidder_name;
        $this->created_at = $created_at;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('auction.' . $this->auction_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'BidPlaced';
    }

    public function broadcastWith(): array
    {
        return [
            'auction_id' => $this->auction_id,
            'amount' => $this->amount,
            'bidder_name' => $this->bidder_name,
            'created_at' => $this->created_at,
        ];
    }
}
