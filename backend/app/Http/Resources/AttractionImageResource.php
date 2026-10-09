<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttractionImageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'attraction_id' => $this->attraction_id,
            'image_path'    => $this->image_path,
            'caption'       => $this->caption,
            'created_at'    => $this->created_at?->toISOString() ?? $this->created_at,
            'updated_at'    => $this->updated_at?->toISOString() ?? $this->updated_at,
        ];
    }
}
