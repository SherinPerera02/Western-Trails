<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'attraction_id'  => $this->attraction_id,
            'user_id'        => $this->user_id,
            'user_name'      => $this->user?->name ?? 'Explorer',
            'place_name'     => $this->attraction?->name ?? null,
            'rating'         => (int) $this->rating,
            'comment'        => $this->comment,
            'status'         => $this->status,
            'created_at'     => $this->created_at?->toISOString(),
            'formatted_date' => $this->created_at?->format('M d, Y'),
        ];
    }
}
