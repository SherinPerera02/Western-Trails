<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlaceResource extends JsonResource
{
    /**
     * Flag to force list representation.
     */
    public static bool $forceList = false;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // First image URL calculation
        $image = null;
        if ($this->relationLoaded('firstImage')) {
            $image = $this->firstImage;
        } elseif ($this->relationLoaded('images')) {
            $image = $this->images->first();
        }

        $imageUrl = null;
        if ($image && $image->image_path) {
            if (str_starts_with($image->image_path, 'http://') || str_starts_with($image->image_path, 'https://')) {
                $imageUrl = $image->image_path;
            } else {
                $imageUrl = asset('storage/' . ltrim($image->image_path, '/'));
            }
        }

        // Average rating calculation
        $avgRating = null;
        if (isset($this->reviews_avg_rating) && $this->reviews_avg_rating !== null) {
            $avgRating = round((float) $this->reviews_avg_rating, 1);
        }

        // Check if serving public places list
        if ($this->isPublicList($request)) {
            return [
                'id'                => $this->id,
                'name'              => $this->name,
                'short_description' => mb_substr($this->description ?? '', 0, 160),
                'categories'        => CategoryResource::collection($this->whenLoaded('categories')),
                'distance_km'       => $this->distance_km !== null ? (float) $this->distance_km : null,
                'entrance_fee'      => $this->entrance_fee !== null ? (float) $this->entrance_fee : null,
                'opening_hours'     => $this->opening_hours,
                'first_image_url'   => $imageUrl,
                'image_url'         => $imageUrl,
                'average_rating'    => $avgRating,
                'latitude'          => (float) $this->latitude,
                'longitude'         => (float) $this->longitude,
            ];
        }

        // Full details representation (for public show and admin views)
        $radiusKm = (float) config('westerntrails.panadura.radius_km', 25);
        $exceedsRadius = $this->distance_km !== null && (float) $this->distance_km > $radiusKm;
        $hasWarning = isset($this->warning) ? (bool) $this->warning : $exceedsRadius;
        $warningMessage = $this->warning ?? ($exceedsRadius
            ? "Attraction is located {$this->distance_km} km from Panadura, which exceeds the recommended {$radiusKm} km radius guideline."
            : null);

        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'description'        => $this->description,
            'address'            => $this->address,
            'latitude'           => (float) $this->latitude,
            'longitude'          => (float) $this->longitude,
            'distance_km'        => $this->distance_km !== null ? (float) $this->distance_km : null,
            'opening_hours'      => $this->opening_hours,
            'entrance_fee'       => $this->entrance_fee !== null ? (float) $this->entrance_fee : null,
            'facilities'         => $this->facilities,
            'activities'         => $this->activities,
            'travel_tips'        => $this->travel_tips,
            'visitor_guidelines' => $this->visitor_guidelines,
            'contact_info'       => $this->contact_info,
            'status'             => $this->status,
            'warning'            => $this->when($hasWarning, $warningMessage),
            'average_rating'     => $avgRating,
            'categories'         => CategoryResource::collection($this->whenLoaded('categories')),
            'images'             => AttractionImageResource::collection($this->whenLoaded('images')),
            'created_at'         => $this->created_at?->toISOString() ?? $this->created_at,
            'updated_at'         => $this->updated_at?->toISOString() ?? $this->updated_at,
            'deleted_at'         => $this->when(
                $request->user()?->role === 'admin',
                $this->deleted_at?->toISOString() ?? $this->deleted_at
            ),
        ];
    }

    /**
     * Determine if the current request is for the public places list.
     */
    protected function isPublicList(Request $request): bool
    {
        if (static::$forceList) {
            return true;
        }

        // Must be GET /api/places or /api/favorites and NOT /api/places/{id} and NOT /api/admin/*
        return ($request->is('api/places') || $request->is('api/favorites*')) && $request->isMethod('GET');
    }
}
