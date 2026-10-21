<?php

namespace App\Services;

use App\Models\PlanItem;
use App\Models\VisitPlan;

class TripPlanService
{
    public const DISCLAIMER = 'Distances and travel times are estimates. This plan is a planning aid, not an optimised route.';

    public function __construct(
        protected DistanceService $distanceService
    ) {}

    /**
     * Compute per-leg information, totals, and formatted items for a visit plan.
     *
     * @return array<string, mixed>
     */
    public function calculatePlanDetails(VisitPlan $plan): array
    {
        $plan->loadMissing([
            'items' => fn ($q) => $q->orderBy('sequence', 'asc'),
            'items.attraction' => fn ($q) => $q->withTrashed()->with(['firstImage', 'images']),
        ]);

        $speed = (float) config('westerntrails.average_speed_kmh', 30);
        if ($speed <= 0) {
            $speed = 30;
        }

        $items = $plan->items;
        $itemsCount = $items->count();

        $itemsData = [];
        $legsData = [];
        $totalDistanceKm = 0.0;
        $totalMinutes = 0;

        for ($i = 0; $i < $itemsCount; $i++) {
            /** @var PlanItem $currentItem */
            $currentItem = $items[$i];
            $currentAttraction = $currentItem->attraction;

            $isUnavailable = ! $currentAttraction
                || $currentAttraction->trashed()
                || $currentAttraction->status !== 'active';

            // Calculate leg to next item if not the last item
            $legToNext = null;
            if ($i < $itemsCount - 1) {
                /** @var PlanItem $nextItem */
                $nextItem = $items[$i + 1];
                $nextAttraction = $nextItem->attraction;

                $nextUnavailable = ! $nextAttraction
                    || $nextAttraction->trashed()
                    || $nextAttraction->status !== 'active';

                if (! $isUnavailable && ! $nextUnavailable) {
                    $cLat = (float) $currentAttraction->latitude;
                    $cLng = (float) $currentAttraction->longitude;
                    $nLat = (float) $nextAttraction->latitude;
                    $nLng = (float) $nextAttraction->longitude;

                    $rawDist = $this->distanceService->calculateDistance($cLat, $cLng, $nLat, $nLng);
                    $legDist = round($rawDist, 1);
                    $legMin = (int) round(($legDist / $speed) * 60);

                    $totalDistanceKm += $legDist;
                    $totalMinutes += $legMin;

                    $legToNext = [
                        'distance_km'        => $legDist,
                        'estimated_minutes'  => $legMin,
                        'from_attraction_id' => $currentAttraction->id,
                        'to_attraction_id'   => $nextAttraction->id,
                    ];

                    $legsData[] = [
                        'from_item_id'       => $currentItem->id,
                        'to_item_id'         => $nextItem->id,
                        'from_attraction_id' => $currentAttraction->id,
                        'to_attraction_id'   => $nextAttraction->id,
                        'from_name'          => $currentAttraction->name,
                        'to_name'            => $nextAttraction->name,
                        'distance_km'        => $legDist,
                        'estimated_minutes'  => $legMin,
                    ];
                }
            }

            // Format attraction image
            $firstImageUrl = null;
            if ($currentAttraction) {
                $image = $currentAttraction->relationLoaded('firstImage') && $currentAttraction->firstImage
                    ? $currentAttraction->firstImage
                    : ($currentAttraction->relationLoaded('images') ? $currentAttraction->images->first() : null);

                if ($image && $image->image_path) {
                    if (str_starts_with($image->image_path, 'http://') || str_starts_with($image->image_path, 'https://')) {
                        $firstImageUrl = $image->image_path;
                    } else {
                        $firstImageUrl = asset('storage/' . ltrim($image->image_path, '/'));
                    }
                }
            }

            $itemsData[] = [
                'id'               => $currentItem->id,
                'sequence'         => (int) $currentItem->sequence,
                'start_time'       => $currentItem->start_time,
                'notes'            => $currentItem->notes,
                'attraction_id'    => (int) $currentItem->attraction_id,
                'unavailable'      => $isUnavailable,
                'opening_hours'    => $currentAttraction?->opening_hours,
                'visit_hours_hint' => $currentAttraction?->opening_hours,
                'attraction'       => $currentAttraction ? [
                    'id'              => $currentAttraction->id,
                    'name'            => $currentAttraction->name,
                    'latitude'        => (float) $currentAttraction->latitude,
                    'longitude'       => (float) $currentAttraction->longitude,
                    'distance_km'     => $currentAttraction->distance_km !== null ? (float) $currentAttraction->distance_km : null,
                    'opening_hours'   => $currentAttraction->opening_hours,
                    'first_image_url' => $firstImageUrl,
                    'status'          => $currentAttraction->status,
                ] : null,
                'leg_to_next'      => $legToNext,
            ];
        }

        return [
            'id'                             => $plan->id,
            'plan_name'                      => $plan->plan_name,
            'visit_date'                     => $plan->visit_date ? $plan->visit_date->format('Y-m-d') : null,
            'items_count'                    => $itemsCount,
            'total_distance_km'              => round($totalDistanceKm, 1),
            'total_estimated_travel_minutes' => $totalMinutes,
            'disclaimer'                     => self::DISCLAIMER,
            'items'                          => $itemsData,
            'legs'                           => $legsData,
            'created_at'                     => $plan->created_at?->toISOString(),
            'updated_at'                     => $plan->updated_at?->toISOString(),
        ];
    }

    /**
     * Calculate total distance for a visit plan (for listing view).
     */
    public function calculateTotalDistanceKm(VisitPlan $plan): float
    {
        $plan->loadMissing([
            'items' => fn ($q) => $q->orderBy('sequence', 'asc'),
            'items.attraction' => fn ($q) => $q->withTrashed(),
        ]);

        $items = $plan->items;
        $count = $items->count();
        if ($count < 2) {
            return 0.0;
        }

        $totalDist = 0.0;
        for ($i = 0; $i < $count - 1; $i++) {
            $a = $items[$i]->attraction;
            $b = $items[$i + 1]->attraction;

            if ($a && $b && ! $a->trashed() && ! $b->trashed() && $a->status === 'active' && $b->status === 'active') {
                $totalDist += round($this->distanceService->calculateDistance(
                    (float) $a->latitude,
                    (float) $a->longitude,
                    (float) $b->latitude,
                    (float) $b->longitude
                ), 1);
            }
        }

        return round($totalDist, 1);
    }
}
