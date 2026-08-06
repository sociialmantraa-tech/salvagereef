<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classified extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'category_id',
        'price',
        'quantity',
        'unit',
        'location_city',
        'location_state',
        'status',
        'created_by',
    ];

    protected $casts = [
        'price' => 'float',
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

    public function images()
    {
        return $this->hasMany(ClassifiedImage::class);
    }

    public function primaryImage()
    {
        return $this->hasOne(ClassifiedImage::class)->where('is_primary', true);
    }
}
