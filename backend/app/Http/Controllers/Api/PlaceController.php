<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePlaceRequest;
use App\Http\Requests\UpdatePlaceRequest;
use App\Http\Resources\PlaceResource;
use App\Models\Attraction;
use App\Services\DistanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class PlaceController extends Controller
{
    public function __construct(
        protected DistanceService $distanceService
    ) {}

    /**
     * Public listing: only active and non-soft-deleted attractions with 15 per page pagination.
     * GET /api/places
     */
    public function index(): AnonymousResourceCollection
    {
        $places = Attraction::with(['categories', 'images'])
            ->where('status', 'active')
            ->paginate(15);

        return PlaceResource::collection($places);
    }

    /**
     * Public show: view single active, non-soft-deleted attraction by id.
     * GET /api/places/{id}
     */
    public function show(string|int $id): JsonResponse|PlaceResource
    {
        $place = Attraction::with(['categories', 'images'])
            ->where('status', 'active')
            ->find($id);

        if (! $place) {
            return response()->json([
                'message' => 'Place not found.',
            ], 404);
        }

        return new PlaceResource($place);
    }

    /**
     * Admin listing: all statuses, supports ?trashed=only to show soft-deleted places.
     * GET /api/admin/places
     */
    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        $query = Attraction::with(['categories', 'images']);

        if ($request->query('trashed') === 'only') {
            $query->onlyTrashed();
        } elseif ($request->boolean('with_trashed') || $request->query('trashed') === 'with') {
            $query->withTrashed();
        }

        $places = $query->paginate(15);

        return PlaceResource::collection($places);
    }

    /**
     * Admin show: view single attraction by id including inactive or soft-deleted.
     * GET /api/admin/places/{id}
     */
    public function adminShow(string|int $id): JsonResponse|PlaceResource
    {
        $place = Attraction::withTrashed()
            ->with(['categories', 'images'])
            ->find($id);

        if (! $place) {
            return response()->json([
                'message' => 'Place not found.',
            ], 404);
        }

        return new PlaceResource($place);
    }

    /**
     * Admin create: store a new place with server-calculated distance and category sync.
     * POST /api/places
     */
    public function store(StorePlaceRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $categoryIds = $validated['category_ids'];
        unset($validated['category_ids']);
        unset($validated['distance_km']); // Prevent client tampering

        // Calculate distance from Panadura base coordinates
        $distanceKm = $this->distanceService->calculateFromPanadura(
            (float) $validated['latitude'],
            (float) $validated['longitude']
        );
        $validated['distance_km'] = $distanceKm;

        $place = DB::transaction(function () use ($validated, $categoryIds) {
            $attraction = Attraction::create($validated);
            $attraction->categories()->sync($categoryIds);

            return $attraction;
        });

        $place->load(['categories', 'images']);

        $hasWarning = $this->distanceService->exceedsRadius($distanceKm);
        $resource = new PlaceResource($place);

        if ($hasWarning) {
            $radius = config('westerntrails.panadura.radius_km', 25);
            $warningMsg = "Attraction is located {$distanceKm} km from Panadura, which exceeds the recommended {$radius} km radius guideline.";
            $place->warning = $warningMsg;
            $resource->additional(['warning' => $warningMsg]);
        }

        return $resource
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Admin update: update existing place, recalculating distance if coordinates change.
     * PUT /api/places/{id}
     */
    public function update(UpdatePlaceRequest $request, string|int $id): JsonResponse|PlaceResource
    {
        $place = Attraction::find($id);

        if (! $place) {
            return response()->json([
                'message' => 'Place not found.',
            ], 404);
        }

        $validated = $request->validated();
        unset($validated['distance_km']); // Prevent client tampering

        $hasCategoryIds = array_key_exists('category_ids', $validated);
        $categoryIds = $hasCategoryIds ? $validated['category_ids'] : null;
        unset($validated['category_ids']);

        // Recalculate distance_km if coordinates changed or provided
        $coordsChanged = array_key_exists('latitude', $validated) || array_key_exists('longitude', $validated);
        if ($coordsChanged) {
            $lat = array_key_exists('latitude', $validated) ? (float) $validated['latitude'] : (float) $place->latitude;
            $lng = array_key_exists('longitude', $validated) ? (float) $validated['longitude'] : (float) $place->longitude;
            $distanceKm = $this->distanceService->calculateFromPanadura($lat, $lng);
            $validated['distance_km'] = $distanceKm;
        } else {
            $distanceKm = $place->distance_km !== null ? (float) $place->distance_km : 0.0;
        }

        DB::transaction(function () use ($place, $validated, $hasCategoryIds, $categoryIds) {
            $place->update($validated);
            if ($hasCategoryIds) {
                $place->categories()->sync($categoryIds);
            }
        });

        $place->load(['categories', 'images']);

        $hasWarning = $this->distanceService->exceedsRadius($distanceKm);
        $resource = new PlaceResource($place);

        if ($hasWarning) {
            $radius = config('westerntrails.panadura.radius_km', 25);
            $warningMsg = "Attraction is located {$distanceKm} km from Panadura, which exceeds the recommended {$radius} km radius guideline.";
            $place->warning = $warningMsg;
            $resource->additional(['warning' => $warningMsg]);
        }

        return $resource
            ->response()
            ->setStatusCode(200);
    }

    /**
     * Admin delete: soft-delete an attraction.
     * DELETE /api/places/{id}
     */
    public function destroy(string|int $id): JsonResponse
    {
        $place = Attraction::find($id);

        if (! $place) {
            return response()->json([
                'message' => 'Place not found.',
            ], 404);
        }

        $place->delete();

        return response()->json([
            'message' => 'Place deleted successfully.',
        ], 200);
    }

    /**
     * Admin restore: restore a soft-deleted attraction.
     * POST /api/admin/places/{id}/restore
     */
    public function restore(string|int $id): JsonResponse|PlaceResource
    {
        $place = Attraction::withTrashed()->find($id);

        if (! $place) {
            return response()->json([
                'message' => 'Place not found.',
            ], 404);
        }

        if (! $place->trashed()) {
            return response()->json([
                'message' => 'Place is not deleted.',
                'data'    => new PlaceResource($place->load(['categories', 'images'])),
            ], 200);
        }

        $place->restore();
        $place->load(['categories', 'images']);

        return (new PlaceResource($place))
            ->additional(['message' => 'Place restored successfully.'])
            ->response()
            ->setStatusCode(200);
    }
}
