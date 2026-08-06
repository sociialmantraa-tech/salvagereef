<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin (SalvageReef Founder)
        User::firstOrCreate(['email' => 'admin@salvagereef.com'], [
            'name' => 'Neelkanth Sharma',
            'email' => 'admin@salvagereef.com',
            'phone' => '7304481166',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'company_name' => 'SalvageReef Solutions',
            'city' => 'Thane',
            'state' => 'Maharashtra',
            'is_verified' => true,
        ]);

        // 2. Agent/Seller
        User::firstOrCreate(['email' => 'agent@salvagereef.com'], [
            'name' => 'Rajesh Metals Agent',
            'email' => 'agent@salvagereef.com',
            'phone' => '9820198201',
            'password' => Hash::make('agent123'),
            'role' => 'agent',
            'company_name' => 'Rajesh Industrial Scrap Traders',
            'city' => 'Bhayander',
            'state' => 'Maharashtra',
            'is_verified' => true,
        ]);

        // 3. Bidder 1
        User::firstOrCreate(['email' => 'bidder@salvagereef.com'], [
            'name' => 'Vikram Scrap Buyer',
            'email' => 'bidder@salvagereef.com',
            'phone' => '9988776655',
            'password' => Hash::make('bidder123'),
            'role' => 'bidder',
            'company_name' => 'Apex Recyclers Ltd',
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
            'is_verified' => true,
        ]);

        // 4. Bidder 2
        User::firstOrCreate(['email' => 'bidder2@salvagereef.com'], [
            'name' => 'Sunil Automotive Recycler',
            'email' => 'bidder2@salvagereef.com',
            'phone' => '9123456789',
            'password' => Hash::make('bidder123'),
            'role' => 'bidder',
            'company_name' => 'Green Earth Salvage',
            'city' => 'Pune',
            'state' => 'Maharashtra',
            'is_verified' => true,
        ]);
    }
}
