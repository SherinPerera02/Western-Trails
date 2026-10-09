<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlaceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
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
}
