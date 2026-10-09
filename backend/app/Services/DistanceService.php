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
}
