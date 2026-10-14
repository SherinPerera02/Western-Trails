<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PlaceController;
use App\Http\Controllers\Api\PlaceImageController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => response()->json(['status' => 'ok']));

// Public: rate limited against brute force
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

// Public Category routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// Public Place routes
Route::get('/places', [PlaceController::class, 'index']);
Route::get('/places/filters', [PlaceController::class, 'filters']);
Route::get('/places/{id}', [PlaceController::class, 'show']);

// Logged-in users (auth:sanctum, active)
Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Admin only (auth:sanctum, active, admin)
    Route::middleware('admin')->group(function () {
        Route::post('/categories', [CategoryController::class, 'store']);
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
