<?php

namespace Database\Seeders;

use App\Models\Auction;
use App\Models\Category;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AuctionSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $agent = User::where('role', 'agent')->first();
        $bidder = User::where('email', 'bidder@salvagereef.com')->first();

        $catMetals = Category::where('slug', 'scrap-metals')->first();
        $catVehicles = Category::where('slug', 'damaged-vehicles')->first();
        $catMachinery = Category::where('slug', 'industrial-machinery')->first();

        $now = Carbon::now();

        $sampleAuctions = [
            // 1. Live Public Scrap Metal Auction
            [
                'title' => '50 MT Heavy Melting Steel (HMS 1 & 2) Scrap Lot',
                'description' => 'High quality structural HMS 1 & 2 steel scrap collected from demolished industrial plant in Thane. High density, clean cut, suitable for immediate furnace induction.',
                'category_id' => $catMetals->id,
                'auction_type' => 'public',
                'status' => 'live',
                'quantity' => 50,
                'unit' => 'MT',
                'starting_price' => 1450000,
                'current_highest_bid' => 1520000,
                'start_time' => $now->copy()->subHours(2),
                'end_time' => $now->copy()->addHours(6),
                'location_city' => 'Thane',
                'location_state' => 'Maharashtra',
                'is_group' => false,
                'created_by' => $agent->id,
                'image' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
            ],
            // 2. Live Public Damaged Fleet Vehicle Auction
            [
                'title' => 'Commercial Fleet Salvage - 3 Damaged Tata Ace Vehicles',
                'description' => 'Insurance claim salvage lot of 3 Tata Ace Gold mini trucks. Engine block intact on 2 units, cabin damage on 1 unit. Sold on AS-IS-WHERE-IS basis.',
                'category_id' => $catVehicles->id,
                'auction_type' => 'public',
                'status' => 'live',
                'quantity' => 3,
                'unit' => 'nos',
                'starting_price' => 280000,
                'current_highest_bid' => 315000,
                'start_time' => $now->copy()->subHours(5),
                'end_time' => $now->copy()->addHours(18),
                'location_city' => 'Bhayander',
                'location_state' => 'Maharashtra',
                'is_group' => false,
                'created_by' => $admin->id,
                'image' => 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80',
            ],
            // 3. Live Private Industrial Asset Auction (Requires Interest Approval)
            [
                'title' => 'Private Tender: 1200 kVA Substation Transformer & Switchgear',
                'description' => 'Exclusive industrial asset disposal for verified corporate buyers only. Siemens 1200 kVA step-down transformer and VCB panels in working condition.',
                'category_id' => $catMachinery->id,
                'auction_type' => 'private',
                'status' => 'live',
                'quantity' => 1,
                'unit' => 'lot',
                'starting_price' => 850000,
                'current_highest_bid' => 910000,
                'start_time' => $now->copy()->subHours(1),
                'end_time' => $now->copy()->addHours(24),
                'location_city' => 'Navi Mumbai',
                'location_state' => 'Maharashtra',
                'is_group' => false,
                'created_by' => $admin->id,
                'image' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
            ],
            // 4. Live Group Auction (Parent Lot)
            [
                'title' => 'Group Auction: Combined Textile Mill Machinery Disposal',
                'description' => 'Bundled auction lot comprising spinning frames, boiler units, and copper wiring harness from closed textile unit in Bhiwandi.',
                'category_id' => $catMachinery->id,
                'auction_type' => 'group',
                'status' => 'live',
                'quantity' => 1,
                'unit' => 'lot',
                'starting_price' => 2200000,
                'current_highest_bid' => 2350000,
                'start_time' => $now->copy()->subHours(3),
                'end_time' => $now->copy()->addHours(12),
                'location_city' => 'Bhiwandi',
                'location_state' => 'Maharashtra',
                'is_group' => true,
                'created_by' => $agent->id,
                'image' => 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
            ],
            // 5. Upcoming Public Auction
            [
                'title' => '15 Tons Insulated Copper Wire & Cable Scrap',
                'description' => 'Heavy grade power distribution cables stripped from telecommunication yard. High recovery percentage of clean electrolytic copper.',
                'category_id' => $catMetals->id,
                'auction_type' => 'public',
                'status' => 'upcoming',
                'quantity' => 15,
                'unit' => 'MT',
                'starting_price' => 9500000,
                'current_highest_bid' => null,
                'start_time' => $now->copy()->addHours(4),
                'end_time' => $now->copy()->addHours(30),
                'location_city' => 'Pune',
                'location_state' => 'Maharashtra',
                'is_group' => false,
                'created_by' => $admin->id,
                'image' => 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80',
            ],
            // 6. Upcoming Private Vehicle Salvage
            [
                'title' => 'Accidental SUV Salvage - Toyota Fortuner 2022 Model',
                'description' => 'Total loss insurance vehicle. Frontal collision damage, rear and powertrain intact. RC transfer / cancellation certificate provided.',
                'category_id' => $catVehicles->id,
                'auction_type' => 'private',
                'status' => 'upcoming',
                'quantity' => 1,
                'unit' => 'nos',
                'starting_price' => 650000,
                'current_highest_bid' => null,
                'start_time' => $now->copy()->addHours(12),
                'end_time' => $now->copy()->addHours(36),
                'location_city' => 'Thane',
                'location_state' => 'Maharashtra',
                'is_group' => false,
                'created_by' => $agent->id,
                'image' => 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
            ],
            // 7. Closed Public Auction (Won by demo bidder)
            [
                'title' => '25 MT Aluminium Ingot & Sheet Scrap',
                'description' => 'Sorted 6063 aluminium extrusion profile scrap. Minimal contamination, bundled securely for export or direct foundry melting.',
                'category_id' => $catMetals->id,
                'auction_type' => 'public',
                'status' => 'closed',
                'quantity' => 25,
                'unit' => 'MT',
                'starting_price' => 4000000,
                'current_highest_bid' => 4350000,
                'start_time' => $now->copy()->subDays(2),
                'end_time' => $now->copy()->subHours(1),
                'location_city' => 'Vapi',
                'location_state' => 'Gujarat',
                'is_group' => false,
                'created_by' => $admin->id,
                'image' => 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
            ],
            // 8. Live Public Auction
            [
                'title' => 'Industrial Diesel Generator 500 kVA Cummins',
                'description' => 'Backup generator unit from data center decommission. 1400 total running hours, acoustic canopy included.',
                'category_id' => $catMachinery->id,
                'auction_type' => 'public',
                'status' => 'live',
                'quantity' => 1,
                'unit' => 'nos',
                'starting_price' => 550000,
                'current_highest_bid' => 620000,
                'start_time' => $now->copy()->subHours(8),
                'end_time' => $now->copy()->addHours(14),
                'location_city' => 'Nashik',
                'location_state' => 'Maharashtra',
                'is_group' => false,
                'created_by' => $agent->id,
                'image' => 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
            ],
            // 9. Live Group Auction Child Sub-Lot
            [
                'title' => 'Sub-Lot A: Textile Mill Electric Motor Package (45 HP x 4)',
                'description' => 'Child item under Combined Textile Mill Machinery Disposal group. 4 units 45 HP ABB induction motors.',
                'category_id' => $catMachinery->id,
                'auction_type' => 'group',
                'status' => 'live',
                'quantity' => 4,
                'unit' => 'nos',
                'starting_price' => 180000,
                'current_highest_bid' => 195000,
                'start_time' => $now->copy()->subHours(3),
                'end_time' => $now->copy()->addHours(12),
                'location_city' => 'Bhiwandi',
                'location_state' => 'Maharashtra',
                'is_group' => true,
                'created_by' => $agent->id,
                'image' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
            ],
            // 10. Live Public Stainless Steel Auction
            [
                'title' => '10 MT Stainless Steel 304 Grade Offcuts & Pipe Scrap',
                'description' => 'Non-magnetic SS 304 piping and sheet cutting scrap from chemical tank manufacturing facility.',
                'category_id' => $catMetals->id,
                'auction_type' => 'public',
                'status' => 'live',
                'quantity' => 10,
                'unit' => 'MT',
                'starting_price' => 1200000,
                'current_highest_bid' => 1280000,
                'start_time' => $now->copy()->subHours(4),
                'end_time' => $now->copy()->addHours(8),
                'location_city' => 'Tarapur',
                'location_state' => 'Maharashtra',
                'is_group' => false,
                'created_by' => $admin->id,
                'image' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
            ],
            // 11. Demo Solar PV Panel Scrap Auction (Demo Item)
            [
                'title' => '25 kW Solar Photovoltaic Panel Scrap & Frame Lot (Demo Item)',
                'description' => 'DEMO ITEM FOR TESTING: High-efficiency monocrystalline solar PV panel salvage lot (25 kW total output) with extruded aluminum mounting structures, DC cabling, and inverter junction boxes.',
                'category_id' => $catMetals->id,
                'auction_type' => 'public',
                'status' => 'live',
                'quantity' => 25,
                'unit' => 'kW',
                'starting_price' => 450000,
                'current_highest_bid' => 520000,
                'start_time' => $now->copy()->subHours(2),
                'end_time' => $now->copy()->addHours(72),
                'location_city' => 'Mumbai',
                'location_state' => 'Maharashtra',
                'is_group' => false,
                'created_by' => $agent->id,
                'image' => 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
            ],
        ];

        $parentGroupAuctionId = null;

        foreach ($sampleAuctions as $index => $item) {
            $imagePath = $item['image'];
            unset($item['image']);

            $item['slug'] = Str::slug($item['title']);

            if ($item['title'] === 'Group Auction: Combined Textile Mill Machinery Disposal') {
                $auction = Auction::create($item);
                $parentGroupAuctionId = $auction->id;
            } elseif ($item['title'] === 'Sub-Lot A: Textile Mill Electric Motor Package (45 HP x 4)') {
                $item['group_id'] = $parentGroupAuctionId;
                $auction = Auction::create($item);
            } else {
                $auction = Auction::create($item);
            }

            // Create Primary Image
            $auction->images()->create([
                'image_path' => $imagePath,
                'is_primary' => true,
            ]);

            // Add initial bid if starting_price & current_highest_bid exist
            if ($auction->current_highest_bid && $bidder) {
                $auction->bids()->create([
                    'user_id' => $bidder->id,
                    'amount' => $auction->current_highest_bid,
                    'created_at' => $now->copy()->subMinutes(30),
                ]);
            }
        }
    }
}
