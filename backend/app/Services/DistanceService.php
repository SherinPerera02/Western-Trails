<?php

namespace App\Services;

class DistanceService
{
    /**
     * Earth radius in kilometers.
     */
    public const EARTH_RADIUS_KM = 6371;

    /**
     * Calculate the great-circle distance between two coordinates in kilometers using the Haversine formula.
     */
    public function calculateDistance(float $latFrom, float $lngFrom, float $latTo, float $lngTo): float
    {
        $latDelta = deg2rad($latTo - $latFrom);
        $lngDelta = deg2rad($lngTo - $lngFrom);

        $latFromRad = deg2rad($latFrom);
        $latToRad   = deg2rad($latTo);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos($latFromRad) * cos($latToRad) *
             sin($lngDelta / 2) * sin($lngDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round(self::EARTH_RADIUS_KM * $c, 2);
    }

    /**
     * Calculate distance from Panadura base coordinates configured in westerntrails.php.
     */
    public function calculateFromPanadura(float $lat, float $lng): float
    {
        $panaduraLat = (float) config('westerntrails.panadura.lat', 6.7133);
        $panaduraLng = (float) config('westerntrails.panadura.lng', 79.9026);

        return $this->calculateDistance($lat, $lng, $panaduraLat, $panaduraLng);
    }

    /**
     * Determine if a calculated distance exceeds the configured radius (default 25 km).
     */
    public function exceedsRadius(float $distanceKm): bool
    {
        $radius = (float) config('westerntrails.panadura.radius_km', 25);

        return $distanceKm > $radius;
    }

    /**
     * Find up to $limit other active attractions within $maxDistanceKm using a SQL bounding-box pre-filter plus Haversine formula.
     * Excludes the place itself.
     *
     * @return array<int, array<string, mixed>>
     */
    public function findNearbyPlaces(\App\Models\Attraction $place, float $maxDistanceKm = 5.0, int $limit = 4): array
    {
        $lat = (float) $place->latitude;
        $lng = (float) $place->longitude;

        if ($lat == 0.0 && $lng == 0.0) {
            return [];
        }

        // Bounding box pre-filter calculation:
        $radDist = $maxDistanceKm / self::EARTH_RADIUS_KM;

        $deltaLat = rad2deg($radDist);
        $minLat = $lat - $deltaLat;
        $maxLat = $lat + $deltaLat;

        $latRad = deg2rad($lat);
        $cosLat = cos($latRad);
        $deltaLng = $cosLat > 0.00001 ? rad2deg($radDist / $cosLat) : $deltaLat;
        $minLng = $lng - abs($deltaLng);
        $maxLng = $lng + abs($deltaLng);

        // SQL Bounding Box pre-filter: only matching rows are loaded into PHP
        $candidates = \App\Models\Attraction::query()
            ->where('status', 'active')
            ->where('id', '!=', $place->id)
            ->whereBetween('latitude', [$minLat, $maxLat])
            ->whereBetween('longitude', [$minLng, $maxLng])
            ->with([
                'categories' => fn ($q) => $q->where('status', 'active'),
                'firstImage',
                'images' => fn ($q) => $q->orderBy('id', 'asc'),
            ])
            ->get();

        $nearby = [];

        foreach ($candidates as $candidate) {
            $cLat = (float) $candidate->latitude;
            $cLng = (float) $candidate->longitude;

            $dist = $this->calculateDistance($lat, $lng, $cLat, $cLng);
            if ($dist <= $maxDistanceKm) {
                $image = $candidate->relationLoaded('firstImage')
                    ? $candidate->firstImage
                    : ($candidate->relationLoaded('images') ? $candidate->images->first() : null);

                $firstImageUrl = null;
                if ($image && $image->image_path) {
                    if (str_starts_with($image->image_path, 'http://') || str_starts_with($image->image_path, 'https://')) {
                        $firstImageUrl = $image->image_path;
                    } else {
                        $firstImageUrl = asset('storage/' . ltrim($image->image_path, '/'));
                    }
                }

                $catNames = $candidate->categories->pluck('name')->values()->all();

                $nearby[] = [
                    'id'                    => $candidate->id,
                    'name'                  => $candidate->name,
                    'categories'            => $catNames,
                    'category_names'        => $catNames,
                    'distance_from_here_km' => $dist,
                    'first_image'           => $firstImageUrl,
                    'first_image_url'       => $firstImageUrl,
                    'image_url'             => $firstImageUrl,
                    'is_restaurant'         => in_array('Restaurant', $catNames) || in_array('Restaurants', $catNames),
                    'is_recreation'         => in_array('Recreation', $catNames),
                ];
            }
        }

        // If fewer than 2 nearby places within 5km, expand radius up to 15km
        if (count($nearby) < 2 && $maxDistanceKm < 15.0) {
            return $this->findNearbyPlaces($place, 15.0, $limit);
        }

        // Sort by distance ascending
        usort($nearby, fn ($a, $b) => $a['distance_from_here_km'] <=> $b['distance_from_here_km']);

        return array_slice($nearby, 0, $limit);
    }
}
