<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuctionController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ClassifiedController;
use App\Http\Controllers\Api\V1\InterestController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public Routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::get('/auctions', [AuctionController::class, 'index']);
    Route::get('/auctions/{slug}', [AuctionController::class, 'show']);

    Route::get('/classifieds', [ClassifiedController::class, 'index']);
    Route::get('/classifieds/{slug}', [ClassifiedController::class, 'show']);

    Route::get('/categories', [CategoryController::class, 'index']);

    // Authenticated Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // Bidding with rate limit (10 reqs/min)
        Route::middleware('throttle:10,1')->post('/auctions/{id}/bid', [AuctionController::class, 'placeBid']);

        // Express Interest in private auctions
        Route::post('/auctions/{id}/interest', [InterestController::class, 'store']);

        // Classified listing creation
        Route::post('/classifieds/post-listing', [ClassifiedController::class, 'store']);

        // User Dashboard & Activities
        Route::get('/user/dashboard', [UserController::class, 'dashboard']);
        Route::get('/user/bids', [UserController::class, 'userBids']);
        Route::get('/user/auctions', [UserController::class, 'userAuctions']);

        // Admin Routes
        Route::prefix('admin')->group(function () {
            Route::get('/dashboard/stats', [AdminController::class, 'stats']);
            Route::get('/users', [AdminController::class, 'users']);
            Route::put('/users/{id}/verify', [AdminController::class, 'verifyUser']);
            Route::put('/users/{id}/toggle-active', [AdminController::class, 'toggleUserActive']);
            Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']);
            Route::get('/auctions/all', [AdminController::class, 'allAuctions']);
            Route::get('/classifieds/all', [AdminController::class, 'allClassifieds']);
            Route::get('/interests/all', [AdminController::class, 'allInterests']);
            Route::put('/interests/{id}/approve', [AdminController::class, 'approveInterest']);
            Route::post('/auctions', [AuctionController::class, 'store']);
            Route::delete('/auctions/{id}', [AdminController::class, 'deleteAuction']);
            Route::delete('/classifieds/{id}', [AdminController::class, 'deleteClassified']);
        });
    });
});
