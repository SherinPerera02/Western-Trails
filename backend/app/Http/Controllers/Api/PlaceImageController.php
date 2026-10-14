<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadPlaceImagesRequest;
use App\Http\Resources\AttractionImageResource;
use App\Models\Attraction;
use App\Models\AttractionImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PlaceImageController extends Controller
{
    /**
     * Upload one or more images for a place.
     * POST /api/admin/places/{id}/images
     */
    public function store(UploadPlaceImagesRequest $request, string|int $id): JsonResponse
    {
        $place = Attraction::find($id);

        if (! $place) {
            return response()->json([
                'message' => 'Place not found.',
            ], 404);
        }

        $files = $request->file('images', []);
        if (! is_array($files)) {
            $files = [$files];
        }

        $captions = $request->input('captions', []);
        $createdImages = [];

        foreach ($files as $index => $file) {
            $extension = $file->guessExtension() ?: $file->getClientOriginalExtension();
            $extension = strtolower($extension);
            if ($extension === 'jpeg') {
                $extension = 'jpg';
            }

            // Always store with a random generated filename, never the original filename
            $filename = Str::random(40) . '.' . $extension;
            $path = $file->storeAs("places/{$place->id}", $filename, 'public');

            $caption = isset($captions[$index]) ? trim((string) $captions[$index]) : null;

            $image = $place->images()->create([
                'image_path' => $path,
                'caption'    => $caption ?: null,
            ]);

            $createdImages[] = $image;
        }

        return response()->json([
            'message' => 'Images uploaded successfully.',
            'data'    => AttractionImageResource::collection(collect($createdImages)),
        ], 201);
    }

    /**
     * Delete an image from DB and storage.
     * DELETE /api/admin/places/{id}/images/{imageId}
     */
    public function destroy(string|int $id, string|int $imageId): JsonResponse
    {
        $place = Attraction::find($id);

        if (! $place) {
            return response()->json([
                'message' => 'Place not found.',
            ], 404);
        }

        /** @var AttractionImage|null $image */
        $image = AttractionImage::where('attraction_id', $place->id)->find($imageId);

        if (! $image) {
            return response()->json([
                'message' => 'Image not found for this place.',
            ], 404);
        }

        $imagePath = $image->image_path;

        // Delete the DB row
        $image->delete();

        // Delete the file from the public storage disk
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }

        return response()->json([
            'message' => 'Image deleted successfully.',
        ], 200);
    }
}
