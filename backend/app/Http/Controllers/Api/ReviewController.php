<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Attraction;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Get approved reviews for a specific attraction.
     * GET /api/places/{placeId}/reviews
     */
    public function index(Request $request, string|int $placeId): JsonResponse
    {
        $place = Attraction::where('status', 'active')->find($placeId);

        if (! $place) {
            return response()->json([
                'message' => 'Place not found.',
            ], 404);
        }

        $query = Review::where('attraction_id', $place->id)
            ->where('status', 'approved')
            ->with('user')
            ->orderBy('created_at', 'desc');

        $reviews = $query->paginate(10);

        $currentUserReview = null;
        if ($request->user()) {
            $myReview = Review::where('attraction_id', $place->id)
                ->where('user_id', $request->user()->id)
                ->with('user')
                ->first();
            if ($myReview) {
                $currentUserReview = new ReviewResource($myReview);
            }
        }

        $avgRating = Review::where('attraction_id', $place->id)
            ->where('status', 'approved')
            ->avg('rating');

        $totalApproved = Review::where('attraction_id', $place->id)
            ->where('status', 'approved')
            ->count();

        return response()->json([
            'data'                => ReviewResource::collection($reviews),
            'current_user_review' => $currentUserReview,
            'average_rating'      => $avgRating !== null ? round((float) $avgRating, 1) : null,
            'reviews_count'       => $totalApproved,
            'meta'                => [
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
                'total'        => $reviews->total(),
            ],
        ]);
    }

    /**
     * Submit or update a review for an attraction.
     * POST /api/places/{placeId}/reviews
     */
    public function store(StoreReviewRequest $request, string|int $placeId): JsonResponse
    {
        $user = $request->user();
        $place = Attraction::where('status', 'active')->find($placeId);

        if (! $place) {
            return response()->json([
                'message' => 'Place not found.',
            ], 404);
        }

        $validated = $request->validated();

        $existing = Review::where('user_id', $user->id)
            ->where('attraction_id', $place->id)
            ->first();

        $statusCode = $existing ? 200 : 201;

        $review = Review::updateOrCreate(
            [
                'user_id'       => $user->id,
                'attraction_id' => $place->id,
            ],
            [
                'rating'  => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
                'status'  => 'approved', // auto-approve so users can immediately view reviews & average rating
            ]
        );

        $review->load('user');

        $avgRating = Review::where('attraction_id', $place->id)
            ->where('status', 'approved')
            ->avg('rating');

        $totalCount = Review::where('attraction_id', $place->id)
            ->where('status', 'approved')
            ->count();

        return response()->json([
            'message'        => $existing ? 'Review updated successfully.' : 'Review submitted successfully.',
            'data'           => new ReviewResource($review),
            'average_rating' => $avgRating !== null ? round((float) $avgRating, 1) : null,
            'reviews_count'  => $totalCount,
        ], $statusCode);
    }

    /**
     * Delete user's own review.
     * DELETE /api/reviews/{id}
     */
    public function destroy(Request $request, string|int $id): JsonResponse
    {
        $review = Review::where('user_id', $request->user()->id)->find($id);

        if (! $review) {
            return response()->json([
                'message' => 'Review not found.',
            ], 404);
        }

        $attractionId = $review->attraction_id;
        $review->delete();

        $avgRating = Review::where('attraction_id', $attractionId)
            ->where('status', 'approved')
            ->avg('rating');

        $totalCount = Review::where('attraction_id', $attractionId)
            ->where('status', 'approved')
            ->count();

        return response()->json([
            'message'        => 'Review deleted successfully.',
            'average_rating' => $avgRating !== null ? round((float) $avgRating, 1) : null,
            'reviews_count'  => $totalCount,
        ]);
    }
}
