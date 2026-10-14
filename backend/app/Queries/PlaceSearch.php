<?php

namespace App\Queries;

use App\Models\Attraction;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PlaceSearch
{
    protected array $appliedFilters = [];

    /**
     * Search and filter places based on request parameters.
     */
    public function search(Request $request): LengthAwarePaginator
    {
        $query = Attraction::query()
            ->where('status', 'active'); // BR-005: only active places; SoftDeletes handles deleted_at

        // Check if reviews table exists and has approved data
        $hasApprovedReviews = Schema::hasTable('reviews')
            && DB::table('reviews')->where('status', 'approved')->exists();

        // 1. Text search (q)
        $q = $request->filled('q') ? trim((string) $request->input('q')) : null;
        if ($q !== null && $q !== '') {
            $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $q);
            $pattern = "%{$escaped}%";
            $operator = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';

            $query->where(function (Builder $builder) use ($operator, $pattern) {
                $builder->where('name', $operator, $pattern)
                    ->orWhere('description', $operator, $pattern)
                    ->orWhere('address', $operator, $pattern)
                    ->orWhere('activities', $operator, $pattern);
            });
        }

        // 2. Category filter (single ID, comma-separated list, or array)
        $categoryInput = $request->input('category');
        $categoryIds = $this->parseCategoryIds($categoryInput);
        if (! empty($categoryIds)) {
            // A place matches if it belongs to ANY of them.
            // BR-005 rule: a category filter must not reveal places from inactive categories.
            $query->whereHas('categories', function (Builder $b) use ($categoryIds) {
                $b->where('status', 'active')
                  ->whereIn('categories.id', $categoryIds);
            });
        }

        // 3. Max distance (km)
        $maxDistance = $request->filled('max_distance') ? (float) $request->input('max_distance') : null;
        if ($maxDistance !== null) {
            $query->where('distance_km', '<=', $maxDistance);
        }

        // 4. Free and Max Fee
        $isFree = $request->boolean('free') || $request->input('free') === '1' || $request->input('free') === 1;
        $maxFee = $request->filled('max_fee') ? (float) $request->input('max_fee') : null;

        if ($isFree) {
            // free: if 1, only places with entrance_fee = 0.
            $query->where('entrance_fee', 0);
        } elseif ($maxFee !== null) {
            // max_fee: keep places with entrance_fee <= value OR entrance_fee IS NULL is excluded
            $query->whereNotNull('entrance_fee')
                  ->where('entrance_fee', '<=', $maxFee);
        }

        // Eager load relations to prevent N+1 queries
        $withRelations = [
            'categories' => function ($b) {
                $b->where('status', 'active');
            },
            'firstImage',
            'images' => function ($b) {
                $b->orderBy('id', 'asc');
            },
        ];

        // Add withAvg for rating only when needed (if approved reviews exist)
        if ($hasApprovedReviews) {
            $query->withAvg(['reviews' => function ($b) {
                $b->where('status', 'approved');
            }], 'rating');
        }

        $query->with($withRelations);

        // 5. Sorting
        $requestedSort = $request->input('sort');
        $actualSort = $this->applySorting($query, $requestedSort, $hasApprovedReviews);

        // Store applied filters to echo in response
        $this->appliedFilters = [
            'q'            => $q,
            'category'     => $categoryInput !== null && $categoryInput !== '' ? $categoryInput : null,
            'max_distance' => $maxDistance,
            'max_fee'      => $maxFee,
            'free'         => $isFree ? 1 : null,
            'sort'         => $actualSort,
        ];

        // Pagination (default 15, max 50)
        $perPage = (int) $request->input('per_page', 15);
        if ($perPage < 1) {
            $perPage = 15;
        } elseif ($perPage > 50) {
            $perPage = 50;
        }

        return $query->paginate($perPage);
    }

    /**
     * Get the filters applied during search.
     */
    public function getAppliedFilters(): array
    {
        return $this->appliedFilters;
    }

    /**
     * Parse category IDs from string, integer, or array.
     */
    protected function parseCategoryIds(mixed $input): array
    {
        if (empty($input)) {
            return [];
        }

        if (is_array($input)) {
            return array_values(array_filter(array_map('intval', $input), fn ($id) => $id > 0));
        }

        $parts = explode(',', (string) $input);
        $ids = [];
        foreach ($parts as $part) {
            $trimmed = trim($part);
            if (ctype_digit($trimmed) && (int) $trimmed > 0) {
                $ids[] = (int) $trimmed;
            }
        }

        return array_values(array_unique($ids));
    }

    /**
     * Apply sorting to query. Returns the effective sort applied.
     */
    protected function applySorting(Builder $query, ?string $sort, bool $hasApprovedReviews): string
    {
        $driver = DB::connection()->getDriverName();

        switch ($sort) {
            case 'distance_desc':
                if ($driver === 'pgsql') {
                    $query->orderByRaw('distance_km DESC NULLS LAST');
                } else {
                    $query->orderByRaw('distance_km IS NULL, distance_km DESC');
                }
                return 'distance_desc';

            case 'name_asc':
                $query->orderBy('name', 'asc');
                return 'name_asc';

            case 'fee_asc':
                if ($driver === 'pgsql') {
                    $query->orderByRaw('entrance_fee ASC NULLS LAST');
                } else {
                    $query->orderByRaw('entrance_fee IS NULL, entrance_fee ASC');
                }
                return 'fee_asc';

            case 'rating_desc':
                if ($hasApprovedReviews) {
                    if ($driver === 'pgsql') {
                        $query->orderByRaw('reviews_avg_rating DESC NULLS LAST');
                        $query->orderByRaw('distance_km ASC NULLS LAST');
                    } else {
                        $query->orderByRaw('reviews_avg_rating IS NULL, reviews_avg_rating DESC');
                        $query->orderByRaw('distance_km IS NULL, distance_km ASC');
                    }
                    return 'rating_desc';
                }
                // Fall back to distance_asc if reviews table has no approved data
                $this->applyDefaultDistanceAsc($query, $driver);
                return 'distance_asc';

            case 'distance_asc':
            default:
                $this->applyDefaultDistanceAsc($query, $driver);
                return 'distance_asc';
        }
    }

    protected function applyDefaultDistanceAsc(Builder $query, string $driver): void
    {
        if ($driver === 'pgsql') {
            $query->orderByRaw('distance_km ASC NULLS LAST');
        } else {
            $query->orderByRaw('distance_km IS NULL, distance_km ASC');
        }
    }
}
