<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attraction;
use App\Models\Category;
use App\Models\Review;
use App\Models\User;
use App\Models\VisitPlan;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    /**
     * Display relevant system statistics for the admin dashboard (REQ-079).
     * GET /api/admin/stats
     */
    public function stats(): JsonResponse
    {
        $placesTotal = Attraction::withTrashed()->count();
        $placesActive = Attraction::where('status', 'active')->count();
        $placesTrashed = Attraction::onlyTrashed()->count();

        $categoriesTotal = Category::count();
        $categoriesActive = Category::where('status', 'active')->count();

        $usersTotal = User::count();
        $usersActive = User::where('status', 'active')->count();
        $usersInactive = User::where('status', 'inactive')->count();
        $touristsCount = User::where('role', 'tourist')->count();
        $adminsCount = User::where('role', 'admin')->count();

        $reviewsTotal = Review::count();
        $reviewsApproved = Review::where('status', 'approved')->count();
        $reviewsPending = Review::where('status', 'pending')->count();
        $avgSystemRating = Review::where('status', 'approved')->avg('rating');

        $plansTotal = VisitPlan::count();

        // Recent 5 registered users
        $recentUsers = User::orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'email', 'role', 'status', 'created_at']);

        // Recent 5 reviews
        $recentReviews = Review::with(['user:id,name', 'attraction:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'data' => [
                'places' => [
                    'total'   => $placesTotal,
                    'active'  => $placesActive,
                    'trashed' => $placesTrashed,
                ],
                'categories' => [
                    'total'  => $categoriesTotal,
                    'active' => $categoriesActive,
                ],
                'users' => [
                    'total'    => $usersTotal,
                    'active'   => $usersActive,
                    'inactive' => $usersInactive,
                    'tourists' => $touristsCount,
                    'admins'   => $adminsCount,
                ],
                'reviews' => [
                    'total'          => $reviewsTotal,
                    'approved'       => $reviewsApproved,
                    'pending'        => $reviewsPending,
                    'average_rating' => $avgSystemRating ? round((float) $avgSystemRating, 1) : null,
                ],
                'plans' => [
                    'total' => $plansTotal,
                ],
                'recent_users'   => $recentUsers,
                'recent_reviews' => $recentReviews->map(fn ($r) => [
                    'id'             => $r->id,
                    'user_name'      => $r->user?->name ?? 'Explorer',
                    'place_name'     => $r->attraction?->name ?? 'Place',
                    'rating'         => $r->rating,
                    'comment'        => $r->comment,
                    'status'         => $r->status,
                    'created_at'     => $r->created_at?->toISOString(),
                    'formatted_date' => $r->created_at?->format('M d, Y'),
                ]),
            ],
        ]);
    }
}
