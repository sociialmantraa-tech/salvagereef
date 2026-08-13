<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Scrap Metals (Ferrous & Non-Ferrous)',
                'slug' => 'scrap-metals',
            ],
            [
                'name' => 'Damaged Vehicles & Fleet Salvage',
                'slug' => 'damaged-vehicles',
            ],
            [
                'name' => 'Industrial Idle Assets & Machinery',
                'slug' => 'industrial-machinery',
            ],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], [
                'name' => $cat['name'],
                'slug' => $cat['slug'],
            ]);
        }
    }
}
