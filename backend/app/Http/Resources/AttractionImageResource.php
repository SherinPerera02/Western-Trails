<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class AttractionImageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $url = null;
        if ($this->image_path) {
            if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://')) {
                $url = $this->image_path;
            } else {
                $url = asset('storage/' . ltrim($this->image_path, '/'));
            }
        }

        return [
            'id'      => $this->id,
            'url'     => $url,
            'caption' => $this->caption,
        ];
    }
}
