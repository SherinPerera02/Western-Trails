<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (['Beach', 'Religious', 'Nature', 'Heritage', 'Restaurant', 'Resort', 'Recreation'] as $name) {
            Category::firstOrCreate(['name' => $name]);
        }
    }
}
