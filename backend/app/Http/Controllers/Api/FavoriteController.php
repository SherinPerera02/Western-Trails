<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlaceResource;
use App\Models\Attraction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * List user's saved places as lightweight place resources.
     * Only active and non-deleted places are returned.
     * GET /api/favorites
     */
    public function index(Request $request): JsonResponse
    {
        $favorites = $request->user()
            ->favorites()
            ->where('status', 'active')
            ->whereNull('attractions.deleted_at')
            ->with(['categories', 'firstImage'])
            ->withAvg('reviews', 'rating')
            ->get();

        return response()->json([
            'data'  => PlaceResource::collection($favorites),
            'total' => $favorites->count(),
        ]);
    }

    /**
     * Get array of saved place IDs for fast UI state.
     * GET /api/favorites/ids
     */
    public function ids(Request $request): JsonResponse
    {
        $ids = $request->user()
            ->favorites()
            ->where('status', 'active')
            ->whereNull('attractions.deleted_at')
            ->pluck('attractions.id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();

        return response()->json([
            'data' => $ids,
            'ids'  => $ids,
        ]);
    }

    /**
     * Add place to user's favorites (idempotent).
     * Returns 200 with current state. Returns 404 if place is inactive or deleted.
     * POST /api/favorites/{placeId}
     */
    public function store(Request $request, string|int $placeId): JsonResponse
    {
        /** @var Attraction|null $place */
        $place = Attraction::where('status', 'active')->find($placeId);

        if (! $place) {
            return response()->json([
                'message' => 'Place not found or inactive.',
            ], 404);
        }

        $request->user()->favorites()->syncWithoutDetaching([$place->id]);

        return response()->json([
            'message'   => 'Place saved to favorites.',
            'favorited' => true,
            'place_id'  => $place->id,
        ], 200);
    }

    /**
     * Remove place from user's favorites (idempotent).
     * DELETE /api/favorites/{placeId}
     */
    public function destroy(Request $request, string|int $placeId): JsonResponse
    {
        $request->user()->favorites()->detach($placeId);

        return response()->json([
            'message'   => 'Place removed from favorites.',
            'favorited' => false,
            'place_id'  => (int) $placeId,
        ], 200);
    }
}
