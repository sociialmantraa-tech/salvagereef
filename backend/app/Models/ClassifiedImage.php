<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassifiedImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'classified_id',
        'image_path',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function classified()
    {
        return $this->belongsTo(Classified::class);
    }
}
