<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Auction extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'category_id',
        'auction_type',
        'status',
        'quantity',
        'unit',
        'starting_price',
        'current_highest_bid',
        'start_time',
        'end_time',
        'location_city',
        'location_state',
        'is_group',
        'group_id',
        'created_by',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'is_group' => 'boolean',
        'starting_price' => 'float',
        'current_highest_bid' => 'float',
        'quantity' => 'float',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function bids()
    {
        return $this->hasMany(Bid::class)->orderBy('amount', 'desc');
    }

    public function images()
    {
        return $this->hasMany(AuctionImage::class);
    }

    public function primaryImage()
    {
        return $this->hasOne(AuctionImage::class)->where('is_primary', true);
    }

    public function interests()
    {
        return $this->hasMany(EnquiryOrInterest::class);
    }

    public function groupParent()
    {
        return $this->belongsTo(Auction::class, 'group_id');
    }

    public function groupChildren()
    {
        return $this->hasMany(Auction::class, 'group_id');
    }
}
