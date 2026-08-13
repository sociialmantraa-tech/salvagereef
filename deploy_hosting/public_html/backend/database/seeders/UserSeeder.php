<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin (SalvageReef Operations Desk)
        User::updateOrCreate(['email' => 'admin@salvagereef.com'], [
            'name' => 'SalvageReef Operations Desk',
            'email' => 'admin@salvagereef.com',
            'phone' => '7304481166',
            'password' => Hash::make('sociial123'),
            'role' => 'admin',
            'company_name' => 'SalvageReef Desk Admin',
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
            'is_verified' => true,
            'is_active' => true,
            'is_email_verified' => true,
            'is_phone_verified' => true,
        ]);

        // 2. Agent/Seller
        User::updateOrCreate(['email' => 'agent@salvagereef.com'], [
            'name' => 'Rajesh Metals Agent',
            'email' => 'agent@salvagereef.com',
            'phone' => '9820198201',
            'password' => Hash::make('agent123'),
            'role' => 'agent',
            'company_name' => 'Rajesh Industrial Scrap Traders',
            'city' => 'Bhayander',
            'state' => 'Maharashtra',
            'is_verified' => true,
            'is_active' => true,
            'is_email_verified' => true,
            'is_phone_verified' => true,
        ]);

        // 3. Bidder 1
        User::updateOrCreate(['email' => 'bidder@salvagereef.com'], [
            'name' => 'Vikram Scrap Buyer',
            'email' => 'bidder@salvagereef.com',
            'phone' => '9988776655',
            'password' => Hash::make('bidder123'),
            'role' => 'bidder',
            'company_name' => 'Apex Recyclers Ltd',
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
            'is_verified' => true,
            'is_active' => true,
            'is_email_verified' => true,
            'is_phone_verified' => true,
        ]);
    }
}
