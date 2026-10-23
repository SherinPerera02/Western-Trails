<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminReviewController extends Controller
{
    /**
     * Admin list all reviews across all attractions with status filter.
     * GET /api/admin/reviews
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Review::with(['user', 'attraction'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('attraction_id')) {
            $query->where('attraction_id', $request->input('attraction_id'));
        }

        $reviews = $query->paginate(20);

        return ReviewResource::collection($reviews);
    }

    /**
     * Admin update review status (approved, rejected, pending).
     * PUT /api/admin/reviews/{id}/status
     */
    public function updateStatus(Request $request, string|int $id): JsonResponse
    {
        $review = Review::with(['user', 'attraction'])->find($id);

        if (! $review) {
            return response()->json([
                'message' => 'Review not found.',
            ], 404);
        }

        $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
        ]);

        $review->status = $request->input('status');
        $review->save();

        return response()->json([
            'message' => "Review status updated to {$review->status}.",
            'data'    => new ReviewResource($review),
        ]);
    }

    /**
     * Admin delete review (REQ-072).
     * DELETE /api/admin/reviews/{id}
     */
    public function destroy(string|int $id): JsonResponse
    {
        $review = Review::find($id);

        if (! $review) {
            return response()->json([
                'message' => 'Review not found.',
            ], 404);
        }

        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully.',
        ]);
    }
}
