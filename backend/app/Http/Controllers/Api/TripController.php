<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddTripItemRequest;
use App\Http\Requests\ReorderTripItemsRequest;
use App\Http\Requests\StoreTripRequest;
use App\Http\Requests\UpdateTripRequest;
use App\Models\PlanItem;
use App\Models\VisitPlan;
use App\Services\TripPlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class TripController extends Controller
{
    public function __construct(
        protected TripPlanService $tripPlanService
    ) {}

    /**
     * List all visit plans for the authenticated user.
     * GET /api/trip
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $plans = $user->plans()
            ->with(['items.attraction' => fn ($q) => $q->withTrashed()])
            ->orderBy('created_at', 'desc')
            ->get();

        $data = $plans->map(function (VisitPlan $plan) {
            return [
                'id'                => $plan->id,
                'plan_name'         => $plan->plan_name,
                'visit_date'        => $plan->visit_date ? $plan->visit_date->format('Y-m-d') : null,
                'items_count'       => $plan->items->count(),
                'total_distance_km' => $this->tripPlanService->calculateTotalDistanceKm($plan),
                'created_at'        => $plan->created_at?->toISOString(),
                'updated_at'        => $plan->updated_at?->toISOString(),
            ];
        });

        return response()->json([
            'data'  => $data,
            'total' => $data->count(),
        ]);
    }

    /**
     * Create a new visit plan.
     * POST /api/trip
     */
    public function store(StoreTripRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $plan = DB::transaction(function () use ($user, $validated) {
            /** @var VisitPlan $plan */
            $plan = $user->plans()->create([
                'plan_name'  => $validated['plan_name'],
                'visit_date' => $validated['visit_date'] ?? null,
            ]);

            if (! empty($validated['attraction_ids'])) {
                foreach ($validated['attraction_ids'] as $index => $attractionId) {
                    $plan->items()->create([
                        'attraction_id' => $attractionId,
                        'sequence'      => $index + 1,
                    ]);
                }
            }

            return $plan;
        });

        $details = $this->tripPlanService->calculatePlanDetails($plan);

        return response()->json([
            'message' => 'Visit plan created successfully.',
            'data'    => $details,
        ], 201);
    }

    /**
     * Show full visit plan with per-leg calculations, totals, and disclaimer.
     * GET /api/trip/{id}
     */
    public function show(Request $request, string|int $id): JsonResponse
    {
        $plan = VisitPlan::find($id);
        if (! $plan) {
            return response()->json(['message' => 'Visit plan not found.'], 404);
        }

        Gate::authorize('view', $plan);

        $details = $this->tripPlanService->calculatePlanDetails($plan);

        return response()->json([
            'data' => $details,
        ]);
    }

    /**
     * Update visit plan details and optionally replace its items list in one call.
     * PUT /api/trip/{id}
     */
    public function update(UpdateTripRequest $request, string|int $id): JsonResponse
    {
        $plan = VisitPlan::find($id);
        if (! $plan) {
            return response()->json(['message' => 'Visit plan not found.'], 404);
        }

        Gate::authorize('update', $plan);

        $validated = $request->validated();

        DB::transaction(function () use ($plan, $validated, $request) {
            if (isset($validated['plan_name'])) {
                $plan->plan_name = $validated['plan_name'];
            }

            if ($request->has('visit_date')) {
                $plan->visit_date = $validated['visit_date'] ?? null;
            }

            $plan->save();

            // If items array is explicitly provided, replace all items in array sequence order
            if ($request->has('items')) {
                $plan->items()->delete();

                if (! empty($validated['items'])) {
                    foreach ($validated['items'] as $index => $itemData) {
                        $plan->items()->create([
                            'attraction_id' => $itemData['attraction_id'],
                            'sequence'      => $index + 1,
                            'start_time'    => $itemData['start_time'] ?? null,
                            'notes'         => $itemData['notes'] ?? null,
                        ]);
                    }
                }
            }
        });

        $details = $this->tripPlanService->calculatePlanDetails($plan->fresh());

        return response()->json([
            'message' => 'Visit plan updated successfully.',
            'data'    => $details,
        ]);
    }

    /**
     * Delete a visit plan.
     * DELETE /api/trip/{id}
     */
    public function destroy(Request $request, string|int $id): JsonResponse
    {
        $plan = VisitPlan::find($id);
        if (! $plan) {
            return response()->json(['message' => 'Visit plan not found.'], 404);
        }

        Gate::authorize('delete', $plan);

        $plan->delete();

        return response()->json([
            'message' => 'Visit plan deleted successfully.',
        ]);
    }

    /**
     * Append a place to the visit plan.
     * POST /api/trip/{id}/items
     */
    public function addItem(AddTripItemRequest $request, string|int $id): JsonResponse
    {
        $plan = VisitPlan::find($id);
        if (! $plan) {
            return response()->json(['message' => 'Visit plan not found.'], 404);
        }

        Gate::authorize('update', $plan);

        // Maximum 12 items check
        if ($plan->items()->count() >= 12) {
            return response()->json([
                'message' => 'A visit plan cannot exceed 12 items.',
                'errors'  => ['attraction_id' => ['A visit plan cannot exceed 12 items.']],
            ], 422);
        }

        // Duplicate attraction check
        $attractionId = (int) $request->input('attraction_id');
        if ($plan->items()->where('attraction_id', $attractionId)->exists()) {
            return response()->json([
                'message' => 'This place is already in your visit plan.',
                'errors'  => ['attraction_id' => ['This place is already in your visit plan.']],
            ], 422);
        }

        $nextSeq = ($plan->items()->max('sequence') ?? 0) + 1;

        $item = $plan->items()->create([
            'attraction_id' => $attractionId,
            'sequence'      => $nextSeq,
            'start_time'    => $request->input('start_time'),
            'notes'         => $request->input('notes'),
        ]);

        $details = $this->tripPlanService->calculatePlanDetails($plan->fresh());

        return response()->json([
            'message' => 'Item added to visit plan.',
            'data'    => $details,
            'item_id' => $item->id,
        ], 201);
    }

    /**
     * Remove an item from the plan and renumber remaining items sequentially.
     * DELETE /api/trip/{id}/items/{itemId}
     */
    public function removeItem(Request $request, string|int $id, string|int $itemId): JsonResponse
    {
        $plan = VisitPlan::find($id);
        if (! $plan) {
            return response()->json(['message' => 'Visit plan not found.'], 404);
        }

        Gate::authorize('update', $plan);

        /** @var PlanItem|null $item */
        $item = $plan->items()->where('id', $itemId)->first();
        if (! $item) {
            return response()->json(['message' => 'Plan item not found.'], 404);
        }

        DB::transaction(function () use ($plan, $item) {
            $item->delete();

            // Renumber remaining items sequentially (1..n)
            $remaining = $plan->items()->orderBy('sequence', 'asc')->get();
            foreach ($remaining as $index => $rem) {
                $rem->update(['sequence' => $index + 1]);
            }
        });

        $details = $this->tripPlanService->calculatePlanDetails($plan->fresh());

        return response()->json([
            'message' => 'Item removed from plan successfully.',
            'data'    => $details,
        ]);
    }

    /**
     * Reorder plan items. Rejects if the IDs provided are not exactly the plan's items.
     * PUT /api/trip/{id}/reorder
     */
    public function reorder(ReorderTripItemsRequest $request, string|int $id): JsonResponse
    {
        $plan = VisitPlan::find($id);
        if (! $plan) {
            return response()->json(['message' => 'Visit plan not found.'], 404);
        }

        Gate::authorize('update', $plan);

        $requestedIds = $request->input('item_ids', []);
        $existingIds = $plan->items()->pluck('id')->all();

        // Exact match check (all IDs must belong to the plan and count must match exactly)
        $sortedExisting = $existingIds;
        sort($sortedExisting);
        $sortedRequested = $requestedIds;
        sort($sortedRequested);

        if ($sortedExisting !== $sortedRequested) {
            return response()->json([
                'message' => 'Invalid item IDs for reordering. All plan items must be included exactly once.',
                'errors'  => ['item_ids' => ['The provided item IDs do not match the items in this plan.']],
            ], 422);
        }

        DB::transaction(function () use ($plan, $requestedIds) {
            foreach ($requestedIds as $index => $itemId) {
                $plan->items()->where('id', $itemId)->update(['sequence' => $index + 1]);
            }
        });

        $details = $this->tripPlanService->calculatePlanDetails($plan->fresh());

        return response()->json([
            'message' => 'Plan items reordered successfully.',
            'data'    => $details,
        ]);
    }
}
