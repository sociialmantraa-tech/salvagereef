<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellScrapRequest extends Model
{
    use HasFactory;

    protected $table = 'sell_scrap_requests';

    protected $fillable = [
        'user_id',
        'seller_name',
        'seller_phone',
        'seller_email',
        'gst_number',
        'title',
        'category_id',
        'category_name',
        'price',
        'quantity',
        'unit',
        'location_state',
        'location_city',
        'site_address',
        'description',
        'image_url',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
