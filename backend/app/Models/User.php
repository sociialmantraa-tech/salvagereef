<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'company_name',
        'city',
        'state',
        'is_verified',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_verified' => 'boolean',
        'password' => 'hashed',
    ];

    public function auctions()
    {
        return $this->hasMany(Auction::class, 'created_by');
    }

    public function bids()
    {
        return $this->hasMany(Bid::class);
    }

    public function classifieds()
    {
        return $this->hasMany(Classified::class, 'created_by');
    }

    public function interests()
    {
        return $this->hasMany(EnquiryOrInterest::class);
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isAgent()
    {
        return $this->role === 'agent' || $this->role === 'admin';
    }
}
