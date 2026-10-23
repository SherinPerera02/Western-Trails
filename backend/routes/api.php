<?php

use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminReviewController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\PlaceController;
use App\Http\Controllers\Api\PlaceImageController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\TripController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => response()->json(['status' => 'ok']));

// Public: rate limited against brute force
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

// Public Category & Place routes (rate limited to 60 req/min against scraping & DoS)
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);

    Route::get('/places', [PlaceController::class, 'index']);
    Route::get('/places/filters', [PlaceController::class, 'filters']);
    Route::get('/places/map', [PlaceController::class, 'map']);
    Route::get('/places/{id}', [PlaceController::class, 'show']);

    // Public reviews listing for an attraction (REQ-070, REQ-071)
    Route::get('/places/{id}/reviews', [ReviewController::class, 'index']);
});

// Logged-in users (auth:sanctum, active)
Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // User reviews submission and deletion (REQ-067, REQ-068, REQ-069)
    Route::post('/places/{id}/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // Visit Planner (Trip) routes
    Route::get('/trip', [TripController::class, 'index']);
    Route::post('/trip', [TripController::class, 'store']);
    Route::get('/trip/{id}', [TripController::class, 'show']);
    Route::put('/trip/{id}', [TripController::class, 'update']);
    Route::delete('/trip/{id}', [TripController::class, 'destroy']);
    Route::post('/trip/{id}/items', [TripController::class, 'addItem']);
    Route::delete('/trip/{id}/items/{itemId}', [TripController::class, 'removeItem']);
    Route::put('/trip/{id}/reorder', [TripController::class, 'reorder']);

    // Favorites routes (REQ-045 to REQ-048)
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::get('/favorites/ids', [FavoriteController::class, 'ids']);
    Route::post('/favorites/{placeId}', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{placeId}', [FavoriteController::class, 'destroy']);

    // Admin only (auth:sanctum, active, admin)
    Route::middleware('admin')->group(function () {
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::post('/category', [CategoryController::class, 'store']); // SRS Sec 3.3 alias
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        Route::post('/places', [PlaceController::class, 'store']);
        Route::put('/places/{id}', [PlaceController::class, 'update']);
        Route::delete('/places/{id}', [PlaceController::class, 'destroy']);

        // Place Image routes (non-prefixed alias)
        Route::post('/places/{id}/images', [PlaceImageController::class, 'store']);
        Route::delete('/places/{id}/images/{imageId}', [PlaceImageController::class, 'destroy']);

        // Admin-prefixed endpoints
        Route::prefix('admin')->group(function () {
            Route::get('/ping', fn () => response()->json(['message' => 'Admin access OK']));

            // Dashboard Statistics (REQ-078, REQ-079, SEC-3.1.8)
            Route::get('/stats', [AdminDashboardController::class, 'stats']);

            // User Management (REQ-099 to REQ-102)
            Route::get('/users', [AdminUserController::class, 'index']);
            Route::put('/users/{id}', [AdminUserController::class, 'update']);
            Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

            // Review Moderation & Deletion (REQ-072)
            Route::get('/reviews', [AdminReviewController::class, 'index']);
            Route::put('/reviews/{id}/status', [AdminReviewController::class, 'updateStatus']);
            Route::delete('/reviews/{id}', [AdminReviewController::class, 'destroy']);

            // Place & Category Admin Views
            Route::get('/categories', [CategoryController::class, 'adminIndex']);
            Route::get('/places', [PlaceController::class, 'adminIndex']);
            Route::get('/places/{id}', [PlaceController::class, 'adminShow']);
            Route::post('/places/{id}/restore', [PlaceController::class, 'restore']);

            // Place Image management
            Route::post('/places/{id}/images', [PlaceImageController::class, 'store']);
            Route::delete('/places/{id}/images/{imageId}', [PlaceImageController::class, 'destroy']);
        });
    });
});
