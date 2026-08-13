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
        'login_id',
        'phone',
        'password',
        'role',
        'google_id',
        'company_name',
        'city',
        'state',
        'is_verified',
        'is_active',
        'email_otp',
        'email_otp_expires_at',
        'phone_otp',
        'phone_otp_expires_at',
        'is_email_verified',
        'is_phone_verified',
        'email_verified_at',
        'email_verification_token',
        'email_verification_expires_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'email_otp',
        'phone_otp',
        'email_verification_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'email_verification_expires_at' => 'datetime',
        'email_otp_expires_at' => 'datetime',
        'phone_otp_expires_at' => 'datetime',
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
        'is_email_verified' => 'boolean',
        'is_phone_verified' => 'boolean',
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
