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
        return round($r * 2 * asin(sqrt($a)), 2);
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Panadura town centre (verified: 6.7133° N, 79.9026° E)
        $origin = [6.7133, 79.9026];

        $places = [
            [
                'name' => 'Panadura Beach',
                'description' => 'A broad golden shoreline where the coastal railway runs parallel to the waves. Renowned for spectacular ocean sunsets, fresh sea breezes, walking promenades, and local street eats.',
                'address' => 'Beach Road, Panadura, Western Province',
                'lat' => 6.7118,
                'lng' => 79.9018,
                'opening_hours' => 'Open 24 hours daily (best visited 06:00 - 18:30)',
                'entrance_fee' => 0.0,
                'facilities' => "Beach promenade\nParking area\nLocal food stalls\nSeating benches",
                'activities' => "Sunset viewing\nWalking and jogging\nStreet food tasting\nKite flying",
                'travel_tips' => 'Early mornings and late afternoons are the coolest times to visit. Bring sunscreen and drinking water.',
                'guidelines' => 'Swimming is not advised during monsoon swells. Please keep the beach clean by using trash bins.',
                'contact_info' => 'Panadura Urban Council: +94 38 223 2275',
                'cats' => ['Beach', 'Nature'],
            ],
            [
                'name' => 'Rankoth Viharaya',
                'description' => 'A revered, centuries-old Buddhist temple situated on an elevated terrace in Panadura. Celebrated for its historic role in the Buddhist revival, serene courtyard, traditional frescoes, and sacred Bodhi tree.',
                'address' => 'Rankoth Vihara Mawatha, Panadura',
                'lat' => 6.7115,
                'lng' => 79.9062,
                'opening_hours' => '05:30 - 20:00 daily',
                'entrance_fee' => 0.0,
                'facilities' => "Shoe deposit counter\nDrinking water\nMeditation hall\nBook stall",
                'activities' => "Temple exploration\nMeditation\nCultural photography\nBodhi puja",
                'travel_tips' => 'Remove footwear and hats before entering the sacred temple premises. Quiet reflection is encouraged.',
                'guidelines' => 'Dress modestly in white or light-colored attire covering shoulders and knees. Avoid posing with your back to Buddha statues.',
                'contact_info' => 'Temple Office: +94 38 223 4112',
                'cats' => ['Religious', 'Heritage'],
            ],
            [
                'name' => 'Bolgoda Lake Waterfront',
                'description' => 'Sri Lanka\'s largest natural freshwater basin, spanning the boundary between Moratuwa and Panadura. Ideal for boat excursions through mangrove labyrinths, biodiversity birdwatching, kayaking, and quiet waterside dining.',
                'address' => 'Bolgoda Lake Road, Panadura Inland',
                'lat' => 6.7350,
                'lng' => 79.9280,
                'opening_hours' => '07:00 - 18:30 daily',
                'entrance_fee' => 0.0,
                'facilities' => "Boat jetty\nLakeside restaurant\nParking\nRestrooms",
                'activities' => "Boat safari\nBirdwatching\nKayaking\nLakeside dining",
                'travel_tips' => 'Book motorboat tours in the morning for best bird sightings including kingfishers and sea eagles.',
                'guidelines' => 'Always wear a life jacket when boarding watercraft. Do not litter in the wetland ecosystem.',
                'contact_info' => 'Bolgoda Excursions: +94 38 224 8890',
                'cats' => ['Nature', 'Recreation'],
            ],
            [
                'name' => 'Wadduwa Beach',
                'description' => 'A tranquil, coconut palm-fringed coastal paradise just south of Panadura. Famous for its golden sands, traditional outrigger fishing canoes, and relaxing beachfront resorts.',
                'address' => 'Samudra Mawatha, Wadduwa',
                'lat' => 6.6660,
                'lng' => 79.9280,
                'opening_hours' => 'Open 24 hours daily',
                'entrance_fee' => 0.0,
                'facilities' => "Resort dining\nBeach showers\nSun lounger areas\nParking",
                'activities' => "Morning walks\nBeach volleyball\nWatching fishermen\nAyurvedic wellness",
                'travel_tips' => 'Great destination for a quiet walk away from city noise. Fresh king coconuts available from local vendors.',
                'guidelines' => 'Respect local fishermen and their nets. Observe ocean safety flags when red flags are raised.',
                'contact_info' => 'Wadduwa Tourism Information: +94 38 228 5540',
                'cats' => ['Beach', 'Nature', 'Resort'],
            ],
            [
                'name' => 'Kalutara Bodhiya',
                'description' => 'One of Sri Lanka\'s most venerated Buddhist pilgrimage shrines, majestically located beside the Kalu River estuary. Features the famous hollow stupa decorated with 74 murals depicting the 550 Jataka tales.',
                'address' => 'Galle Road, Kalutara South Bridge',
                'lat' => 6.5855,
                'lng' => 79.9602,
                'opening_hours' => '05:00 - 21:00 daily',
                'entrance_fee' => 0.0,
                'facilities' => "Hollow stupa walkthrough\nShoe deposit counter\nRestrooms\nWheelchair ramp\nInformation center",
                'activities' => "Bodhi veneration\nStupa interior mural viewing\nRiver estuary photography\nEvening blessings",
                'travel_tips' => 'The interior of the hollow stupa stays pleasantly cool and offers extraordinary artistic frescoes.',
                'guidelines' => 'Strict modest dress code required. Remove shoes and hats before entering the upper sanctuary terrace.',
                'contact_info' => 'Kalutara Bodhi Trust: +94 34 222 2353',
                'cats' => ['Religious', 'Heritage'],
            ],
            [
                'name' => 'Richmond Castle',
                'description' => 'A magnificent Edwardian mansion estate built between 1896 and 1910 by wealthy philanthropist Mudaliyar Don Arthur de Silva Wijesinghe. Features imported Italian marble, Scottish glass, hand-carved Burmese teak, and sprawling fruit orchards.',
                'address' => 'Riverside Road, Palatota, Kalutara',
                'lat' => 6.5910,
                'lng' => 79.9820,
                'opening_hours' => '09:00 - 16:30 Tuesday to Sunday (Closed Mondays)',
                'entrance_fee' => 200.0,
                'facilities' => "Ticket office\nGuided tour guides\nVisitor garden\nRestrooms\nParking",
                'activities' => "Architectural tour\nEstate gardens walk\nHistorical heritage photography\nColonial artifact viewing",
                'travel_tips' => 'Entry tickets help fund the local orphanage trust created by the Mudaliyar. Allow at least 1.5 hours to tour the estate.',
                'guidelines' => 'Do not touch historical woodwork or vintage glass displays. Flash photography restricted in the main ballroom.',
                'contact_info' => 'Richmond Castle Trust: +94 34 222 8900',
                'cats' => ['Heritage', 'Recreation'],
            ],
            [
                'name' => 'Calido Beach Kalutara',
                'description' => 'A scenic narrow spit of golden sand separating the ocean waves from the tranquil estuary of the Kalu Ganga river. Perfect for landscape photography, coastal breezes, and watching river boaters meet the sea.',
                'address' => 'Calido Road, Kalutara North',
                'lat' => 6.5780,
                'lng' => 79.9570,
                'opening_hours' => 'Open 24 hours daily',
                'entrance_fee' => 0.0,
                'facilities' => "Beach parking\nSeafood snack stalls\nFishing viewing points",
                'activities' => "River mouth walking\nCoastal photography\nSunset viewing\nBeach fishing",
                'travel_tips' => 'The narrow strip offers views of both ocean waves and calm river water simultaneously.',
                'guidelines' => 'Currents near the river mouth can be treacherous; swimming in the estuary confluence is strictly discouraged.',
                'contact_info' => 'Kalutara Tourist Board: +94 34 222 2500',
                'cats' => ['Beach', 'Nature'],
            ],
            [
                'name' => 'Holy Cross Church Kalutara',
                'description' => 'A striking hilltop Catholic church commanding panoramic views over the Indian Ocean and Galle Road. Built in Gothic and classical revival style, it serves as a central spiritual sanctuary on the western seaboard.',
                'address' => 'Holy Cross Hill, Galle Road, Kalutara',
                'lat' => 6.5815,
                'lng' => 79.9620,
                'opening_hours' => '06:00 - 19:30 daily',
                'entrance_fee' => 0.0,
                'facilities' => "Church sanctuary\nOcean-view hilltop terrace\nRestrooms\nParking",
                'activities' => "Spiritual reflection\nOcean vista photography\nGothic architecture appreciation",
                'travel_tips' => 'Climb to the hilltop church terrace just before sunset for sweeping ocean views across the coastline.',
                'guidelines' => 'Please maintain silence inside the church nave during prayer services and mass.',
                'contact_info' => 'Church Parish Office: +94 34 222 2291',
                'cats' => ['Religious', 'Heritage'],
            ],
            [
                'name' => 'Panadura River Sanctuary',
                'description' => 'A lush eco-corridor along the northern tributary of Panadura Ganga where water plants, egrets, cormorants, and monitor lizards thrive in protected mangrove habitats.',
                'address' => 'Nalluruwa Canal Bank, Panadura',
                'lat' => 6.7190,
                'lng' => 79.9120,
                'opening_hours' => '06:00 - 18:00 daily',
                'entrance_fee' => 0.0,
                'facilities' => "Walking boardwalk\nBird observation deck\nInformational nature plaques",
                'activities' => "Nature walking\nBirdwatching\nBotanical study\nMacro photography",
                'travel_tips' => 'Bring binoculars for observing migratory wading birds in the early morning.',
                'guidelines' => 'Do not feed wild animals or pluck mangrove saplings.',
                'contact_info' => 'Wetland Protection Unit: +94 38 223 3001',
                'cats' => ['Nature', 'Recreation'],
            ],
            [
                'name' => 'Wadduwa Palm Grove & Crafts Trail',
                'description' => 'A cultural handicraft village where local artisans preserve centuries-old coastal craft traditions including coir spinning, reed basket weaving, and traditional mask carving.',
                'address' => 'Molligoda Road, Wadduwa',
                'lat' => 6.6710,
                'lng' => 79.9320,
                'opening_hours' => '08:30 - 17:30 Monday to Saturday',
                'entrance_fee' => 0.0,
                'facilities' => "Artisan craft workshops\nGift souvenir shop\nRestrooms\nRefreshment stall",
                'activities' => "Craft demonstration viewing\nSouvenir shopping\nArtisan interaction\nPhotography",
                'travel_tips' => 'Visitors can purchase authentic handmade Sri Lankan crafts directly from the artisans.',
                'guidelines' => 'Ask for permission before taking close-up portraits of working craftspeople.',
                'contact_info' => 'Wadduwa Artisans Guild: +94 38 228 9110',
                'cats' => ['Heritage', 'Recreation'],
            ],
            [
                'name' => 'Kalutara North Seafood Promenade',
                'description' => 'A vibrant coastal culinary strip featuring traditional Sri Lankan seafood restaurants, beachfront dining cabanas, fresh lagoon crab, and authentic southern spicy fish curries.',
                'address' => 'Coast Highway, Kalutara North',
                'lat' => 6.5980,
                'lng' => 79.9550,
                'opening_hours' => '11:00 - 22:30 daily',
                'entrance_fee' => 0.0,
                'facilities' => "Waterfront seating\nParking\nRestrooms\nFree Wi-Fi",
                'activities' => "Culinary dining\nSunset dinner\nLagoon seafood tasting\nEvening socializing",
                'travel_tips' => 'Sample the famous devilled cuttlefish and coconut roti while watching the waves crash at twilight.',
                'guidelines' => 'Peak dinner hours are 19:30 - 21:00 on weekends; early arrival is recommended for oceanfront tables.',
                'contact_info' => 'Seafood Promenade Association: +94 34 223 6700',
                'cats' => ['Restaurant', 'Recreation'],
            ],
            [
                'name' => 'Asokaramaya Buddhist Temple Kalutara',
                'description' => 'A historic seaside Buddhist monastic complex known for its peaceful meditation grounds, elaborate stone archways, and heritage library dating back to the late 19th century.',
                'address' => 'Asokaramaya Road, Kalutara North',
                'lat' => 6.5920,
                'lng' => 79.9650,
                'opening_hours' => '06:00 - 20:00 daily',
                'entrance_fee' => 0.0,
                'facilities' => "Peace pavilion\nMeditation garden\nShoe deposit\nRestrooms",
                'activities' => "Meditation\nArchitectural study\nQuiet contemplation\nCultural education",
                'travel_tips' => 'A peaceful retreat from Galle Road traffic. Monks welcome respectful questions about Buddhist philosophy.',
                'guidelines' => 'Appropriate white attire required. Turn off mobile ringtones on the meditation grounds.',
                'contact_info' => 'Asokaramaya Monastery: +94 34 222 1880',
                'cats' => ['Religious', 'Heritage'],
            ],
        ];

        $imageMap = [
            'Panadura Beach'                      => 'places/panadura-beach.jpg',
            'Rankoth Viharaya'                    => 'places/rankoth-viharaya.jpg',
            'Bolgoda Lake Waterfront'             => 'places/bolgoda-lake.jpg',
            'Wadduwa Beach'                       => 'places/wadduwa-beach.jpg',
            'Kalutara Bodhiya'                    => 'places/kalutara-bodhiya.jpg',
            'Richmond Castle'                     => 'places/richmond-castle.jpg',
            'Calido Beach Kalutara'               => 'places/calido-beach.jpg',
            'Holy Cross Church Kalutara'          => 'places/holy-cross-church.jpg',
            'Panadura River Sanctuary'            => 'places/panadura-river-sanctuary.jpg',
            'Wadduwa Palm Grove & Crafts Trail'   => 'places/wadduwa-palm-grove.jpg',
            'Kalutara North Seafood Promenade'    => 'places/kalutara-seafood-promenade.jpg',
            'Asokaramaya Buddhist Temple Kalutara'=> 'places/asokaramaya-temple.jpg',
        ];

        foreach ($places as $p) {
            $dist = $this->haversineKm($origin[0], $origin[1], $p['lat'], $p['lng']);

            $attraction = Attraction::updateOrCreate(
                ['name' => $p['name']],
                [
                    'description' => $p['description'],
                    'address' => $p['address'],
                    'latitude' => $p['lat'],
                    'longitude' => $p['lng'],
                    'distance_km' => $dist,
                    'opening_hours' => $p['opening_hours'],
                    'entrance_fee' => $p['entrance_fee'],
                    'facilities' => $p['facilities'],
                    'activities' => $p['activities'],
                    'travel_tips' => $p['travel_tips'],
                    'visitor_guidelines' => $p['guidelines'],
                    'contact_info' => $p['contact_info'],
                    'status' => 'active',
                ]
            );

            $attraction->categories()->sync(
                Category::whereIn('name', $p['cats'])->pluck('id')
            );

            if (isset($imageMap[$p['name']])) {
                \App\Models\AttractionImage::updateOrCreate(
                    [
                        'attraction_id' => $attraction->id,
                        'image_path'    => $imageMap[$p['name']],
                    ],
                    [
                        'caption' => $attraction->name,
                    ]
                );
            }
        }

        // Ensure any extra active places in DB also have a valid fallback image
        $extraPlaces = Attraction::whereDoesntHave('images')->get();
        foreach ($extraPlaces as $extra) {
            $fallback = 'places/hero-coast.jpg';
            if (str_contains(strtolower($extra->name), 'beach') || str_contains(strtolower($extra->name), 'shore')) {
                $fallback = 'places/panadura-beach.jpg';
            } elseif (str_contains(strtolower($extra->name), 'temple') || str_contains(strtolower($extra->name), 'vihara')) {
                $fallback = 'places/rankoth-viharaya.jpg';
            }
            \App\Models\AttractionImage::create([
                'attraction_id' => $extra->id,
                'image_path'    => $fallback,
                'caption'       => $extra->name,
            ]);
        }
    }
}
