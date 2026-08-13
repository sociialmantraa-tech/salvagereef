<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ErrorLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'severity',
        'message',
        'exception_class',
        'file',
        'line',
        'url',
        'method',
        'ip_address',
        'user_agent',
        'user_id',
        'stack_trace',
        'status',
    ];

    protected $casts = [
        'line' => 'integer',
        'user_id' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
