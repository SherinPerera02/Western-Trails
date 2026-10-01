<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => response()->json(['status' => 'ok']));

// Public: rate limited against brute force
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

// Logged-in users
Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Admin only (M2 and M7 routes will go inside this group)
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/ping', fn () => response()->json(['message' => 'Admin access OK']));
    });
});
