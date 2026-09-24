<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuctionController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ClassifiedController;
use App\Http\Controllers\Api\V1\ForgotPasswordController;
use App\Http\Controllers\Api\V1\InterestController;
use App\Http\Controllers\Api\V1\SellScrapRequestController;
use App\Http\Controllers\Api\V1\SystemErrorController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public System Status, Health Check & Error Ingestion
    Route::get('/system/status', [SystemErrorController::class, 'getSystemStatus']);
    Route::post('/errors/report', [SystemErrorController::class, 'reportError']);

    // Public Authentication & Password Reset Routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::get('/auth/verify-email', [AuthController::class, 'verifyEmailLink']);
    Route::post('/auth/google', [AuthController::class, 'googleLogin']);

    // Forgot Password Email OTP Endpoints
    Route::post('/forgot-password/send-otp', [ForgotPasswordController::class, 'sendOtp']);
    Route::post('/forgot-password/verify-otp', [ForgotPasswordController::class, 'verifyOtp']);
    Route::post('/forgot-password/resend-otp', [ForgotPasswordController::class, 'resendOtp']);
    Route::post('/forgot-password/reset', [ForgotPasswordController::class, 'resetPassword']);

    // Legacy OTP Route Aliases for Compatibility
    Route::post('/auth/send-otp', [ForgotPasswordController::class, 'sendOtp']);
    Route::post('/auth/resend-otp', [ForgotPasswordController::class, 'resendOtp']);
    Route::post('/auth/verify-email-otp', [ForgotPasswordController::class, 'verifyOtp']);
    Route::post('/auth/verify-phone-otp', [ForgotPasswordController::class, 'verifyOtp']);

    // Public Catalog & Auctions Routes
    Route::get('/auctions', [AuctionController::class, 'index']);
    Route::get('/auctions/{slug}', [AuctionController::class, 'show']);
    Route::get('/classifieds', [ClassifiedController::class, 'index']);
    Route::get('/classifieds/{slug}', [ClassifiedController::class, 'show']);
    Route::get('/categories', [CategoryController::class, 'index']);

    // Authenticated User Routes (Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // Bidding with rate limit (10 reqs/min)
        Route::middleware('throttle:10,1')->post('/auctions/{id}/bid', [AuctionController::class, 'placeBid']);

        // Express Interest in private auctions
        Route::post('/auctions/{id}/interest', [InterestController::class, 'store']);

        // Sell scrap request submission (open for all registered users)
        Route::post('/sell-scrap-requests', [SellScrapRequestController::class, 'store']);

        // Classified listing creation
        Route::post('/classifieds/post-listing', [ClassifiedController::class, 'store']);

        // User Dashboard & Activities
        Route::get('/user/dashboard', [UserController::class, 'dashboard']);
        Route::get('/user/bids', [UserController::class, 'userBids']);
        Route::get('/user/auctions', [UserController::class, 'userAuctions']);
    });

    // Server-Side Admin Routes (Enforces Admin Middleware Check)
    Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::get('/dashboard/stats', [AdminController::class, 'stats']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
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

        // Sell Scrap Requests Admin Desk
        Route::get('/sell-scrap-requests', [SellScrapRequestController::class, 'index']);
        Route::put('/sell-scrap-requests/{id}/status', [SellScrapRequestController::class, 'updateStatus']);
        Route::delete('/sell-scrap-requests/{id}', [SellScrapRequestController::class, 'destroy']);

        Route::get('/auctions/{id}/top-bidders', [AuctionController::class, 'getTopBidders']);
        Route::get('/bids', [AdminController::class, 'allBids']);
        Route::put('/bids/{id}/status', [AdminController::class, 'updateBidStatus']);

        // System Errors & Maintenance Management
        Route::get('/errors', [SystemErrorController::class, 'index']);
        Route::get('/errors/stats', [SystemErrorController::class, 'stats']);
        Route::put('/errors/{id}/status', [SystemErrorController::class, 'updateStatus']);
        Route::delete('/errors/clear', [SystemErrorController::class, 'clearLogs']);
        Route::get('/errors/download-log', [SystemErrorController::class, 'downloadLogFile']);
        Route::get('/logs', [SystemErrorController::class, 'getRawLogs']);
        Route::post('/maintenance/toggle', [SystemErrorController::class, 'toggleMaintenance']);
    });
});
