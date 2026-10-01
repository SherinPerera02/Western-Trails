<?php

namespace Database\Seeders;

use App\Models\Attraction;
use App\Models\Category;
use Illuminate\Database\Seeder;

class AttractionSeeder extends Seeder
{
    /**
     * Calculate Haversine distance in kilometers between two coordinates.
     */
    private function haversineKm($lat1, $lng1, $lat2, $lng2): float
    {
        $r = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return round($r * 2 * asin(sqrt($a)), 1);
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Panadura town centre (verified on OpenStreetMap: 6.7133° N, 79.9026° E)
        $origin = [6.7133, 79.9026];

        $places = [
            [
                'name' => 'Panadura Beach',
                'description' => 'Coastal attraction good for relaxing, sightseeing and sunset viewing.',
                'lat' => 6.7118204,
                'lng' => 79.9017795,
                'cats' => ['Beach', 'Nature'],
            ],
            [
                'name' => 'Rankoth Viharaya',
                'description' => 'A historically significant Buddhist temple in Panadura.',
                'lat' => 6.7115427,
                'lng' => 79.9061866,
                'cats' => ['Religious', 'Heritage'],
                'guidelines' => 'Dress modestly. Check photography rules at the temple.',
            ],
            // TODO: Add remaining 10 places from Table 2 of the proposal
        ];

        foreach ($places as $p) {
            $attraction = Attraction::firstOrCreate(
                ['name' => $p['name']],
                [
                    'description' => $p['description'],
                    'latitude' => $p['lat'],
                    'longitude' => $p['lng'],
                    'distance_km' => $this->haversineKm($origin[0], $origin[1], $p['lat'], $p['lng']),
                    'visitor_guidelines' => $p['guidelines'] ?? null,
                ]
            );

            $attraction->categories()->sync(
                Category::whereIn('name', $p['cats'])->pluck('id')
            );
        }
    }
}
