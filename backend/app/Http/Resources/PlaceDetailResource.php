<?php

namespace App\Http\Resources;

use App\Services\DistanceService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlaceDetailResource extends JsonResource
{
    /**
     * Optional pre-calculated nearby places.
     */
    protected ?array $nearbyPlaces = null;

    /**
     * Create a new resource instance.
     */
    public function __construct($resource, ?array $nearbyPlaces = null)
    {
        parent::__construct($resource);
        $this->nearbyPlaces = $nearbyPlaces;
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Format images as array of {id, url, caption}
        $images = [];
        if ($this->relationLoaded('images')) {
            $images = $this->images->map(function ($img) {
                $url = null;
                if ($img->image_path) {
                    if (str_starts_with($img->image_path, 'http://') || str_starts_with($img->image_path, 'https://')) {
                        $url = $img->image_path;
                    } else {
                        $url = asset('storage/' . ltrim($img->image_path, '/'));
                    }
                }

                return [
                    'id'      => $img->id,
                    'url'     => $url,
                    'caption' => $img->caption,
                ];
            })->all();
        }

        // Average rating and reviews count (only approved reviews; null/0 when none)
        $avgRating = null;
        if (isset($this->reviews_avg_rating) && $this->reviews_avg_rating !== null) {
            $avgRating = round((float) $this->reviews_avg_rating, 1);
        }

        $reviewsCount = 0;
        if (isset($this->reviews_count)) {
            $reviewsCount = (int) $this->reviews_count;
        }

        // Entrance fee and is_free
        $entranceFee = $this->entrance_fee !== null ? (float) $this->entrance_fee : null;
        $isFree = $entranceFee === null || $entranceFee === 0.0;

        // Nearby places calculation (up to 4 places within 5km, excluding itself)
        $nearby = $this->nearbyPlaces;
        if ($nearby === null && isset($this->nearby_places)) {
            $nearby = is_array($this->nearby_places) ? $this->nearby_places : $this->nearby_places->all();
        }
        if ($nearby === null) {
            /** @var DistanceService $distanceService */
            $distanceService = app(DistanceService::class);
            $nearby = $distanceService->findNearbyPlaces($this->resource, 5.0, 4);
        }

        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'categories'         => CategoryResource::collection($this->whenLoaded('categories')),
            'description'        => $this->description,
            'address'            => $this->address,
            'latitude'           => (float) $this->latitude,
            'longitude'          => (float) $this->longitude,
            'distance_km'        => $this->distance_km !== null ? (float) $this->distance_km : null,
            'opening_hours'      => $this->opening_hours,
            'entrance_fee'       => $entranceFee,
            'is_free'            => $isFree,
            'facilities'         => $this->formatMultiLine($this->facilities),
            'activities'         => $this->formatMultiLine($this->activities),
            'travel_tips'        => $this->travel_tips,
            'visitor_guidelines' => $this->visitor_guidelines,
            'contact_info'       => $this->contact_info,
            'images'             => $images,
            'average_rating'     => $avgRating,
            'reviews_count'      => $reviewsCount,
            'nearby'             => $nearby,
        ];
    }

    /**
     * Split text fields that contain several items only if they are stored as separate lines; otherwise return as-is.
     */
    protected function formatMultiLine(?string $text): mixed
    {
        if ($text === null) {
            return null;
        }

        $trimmed = trim($text);
        if ($trimmed === '') {
            return null;
        }

        // If stored as separate lines, split into an array of items
        if (str_contains($trimmed, "\n") || str_contains($trimmed, "\r")) {
            $lines = preg_split('/\r\n|\r|\n/', $trimmed);
            $items = array_values(array_filter(array_map('trim', $lines), fn ($line) => $line !== ''));
            return count($items) > 1 ? $items : ($items[0] ?? $text);
        }

        return $text;
    }
}
