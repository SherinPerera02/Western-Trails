<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'description'       => $this->description,
            'status'            => $this->status,
            'attractions_count' => $this->when(
                isset($this->attractions_count),
                $this->attractions_count
            ),
            'created_at'        => $this->created_at?->toISOString() ?? $this->created_at,
            'updated_at'        => $this->updated_at?->toISOString() ?? $this->updated_at,
        ];
    }
}
