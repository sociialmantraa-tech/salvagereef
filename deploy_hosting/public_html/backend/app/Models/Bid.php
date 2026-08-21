<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bid extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'auction_id',
        'user_id',
        'amount',
        'created_at',
    ];

    protected $casts = [
        'amount' => 'float',
        'created_at' => 'datetime',
    ];

    public function auction()
    {
        return $this->belongsTo(Auction::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
