<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Classified;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ClassifiedSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $agent = User::where('role', 'agent')->first();

        $catMetals = Category::where('slug', 'scrap-metals')->first();
        $catVehicles = Category::where('slug', 'damaged-vehicles')->first();
        $catMachinery = Category::where('slug', 'industrial-machinery')->first();

        $classifieds = [
            [
                'title' => 'Used Lathe Machine - Heavy Duty 10 Feet Bed',
                'description' => 'Fully operational Enterprise 1550 lathe machine with 4-jaw chuck and steadies. Ready for immediate load and dispatch from workshop in Bhayander.',
                'category_id' => $catMachinery->id,
                'price' => 175000,
                'quantity' => 1,
                'unit' => 'nos',
                'location_city' => 'Bhayander',
                'location_state' => 'Maharashtra',
                'status' => 'available',
                'created_by' => $agent->id,
                'image' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
            ],
            [
                'title' => 'Brass Scrap Honey Grade (Balus) - 2.5 Tons',
                'description' => 'Clean honey grade brass scrap (valves, plumbing fittings) available for direct buyer pickup in Thane.',
                'category_id' => $catMetals->id,
                'price' => 1125000,
                'quantity' => 2.5,
                'unit' => 'MT',
                'location_city' => 'Thane',
                'location_state' => 'Maharashtra',
                'status' => 'available',
                'created_by' => $admin->id,
                'image' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
            ],
            [
                'title' => 'Forklift Truck Diesel 3 Ton Capacity - Godrej',
                'description' => '2019 Godrej 3-ton diesel forklift. Needs hydraulic seal maintenance. Engine starts and drives cleanly.',
                'category_id' => $catMachinery->id,
                'price' => 290000,
                'quantity' => 1,
                'unit' => 'nos',
                'location_city' => 'Navi Mumbai',
                'location_state' => 'Maharashtra',
                'status' => 'available',
                'created_by' => $agent->id,
                'image' => 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
            ],
            [
                'title' => 'Hydraulic Scrap Baler Machine (Double Action)',
                'description' => 'Heavy duty 100-ton hydraulic bundling press for metal scrap. Suitable for compressing light steel sheets and tin cans.',
                'category_id' => $catMachinery->id,
                'price' => 450000,
                'quantity' => 1,
                'unit' => 'nos',
                'location_city' => 'Mumbai',
                'location_state' => 'Maharashtra',
                'status' => 'available',
                'created_by' => $admin->id,
                'image' => 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
            ],
            [
                'title' => 'Scrap E-Waste Circuit Boards & Computer Motherboards',
                'description' => '1.2 Tons sorted green motherboards and server RAM cards. Ideal for precious metal refiners and certified recyclers.',
                'category_id' => $catMetals->id,
                'price' => 380000,
                'quantity' => 1.2,
                'unit' => 'MT',
                'location_city' => 'Pune',
                'location_state' => 'Maharashtra',
                'status' => 'available',
                'created_by' => $agent->id,
                'image' => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
            ],
        ];

        foreach ($classifieds as $item) {
            $imagePath = $item['image'];
            unset($item['image']);

            $item['slug'] = Str::slug($item['title']);
            $classified = Classified::create($item);

            $classified->images()->create([
                'image_path' => $imagePath,
                'is_primary' => true,
            ]);
        }
    }
}
