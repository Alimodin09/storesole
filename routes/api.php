<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RiderController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/admin-login', [AuthController::class, 'adminLogin']);
    Route::post('/rider-login', [RiderController::class, 'login']);
    Route::post('/rider-register', [RiderController::class, 'register']);
    Route::post('/forgot-password', [PasswordResetController::class, 'store']);
    Route::post('/reset-password', [PasswordResetController::class, 'update']);
});

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

Route::middleware('protectAdmin')->group(function (): void {
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::put('/orders/{order}', [OrderController::class, 'update']);

    Route::get('/riders', [RiderController::class, 'index']);
    Route::post('/orders/{order}/assign-rider', [RiderController::class, 'assignRider']);

    Route::get('/reports/sales', [ReportController::class, 'sales']);
});

Route::middleware('protectUser')->group(function (): void {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/user/orders', [OrderController::class, 'myOrders']);
    Route::get('/user/orders/{order}', [OrderController::class, 'showMyOrder']);
});

Route::middleware('protectRider')->group(function (): void {
    Route::get('/rider/orders', [RiderController::class, 'myOrders']);
    Route::post('/rider/orders/{order}/accept', [RiderController::class, 'acceptOrder']);
    Route::post('/rider/orders/{order}/reject', [RiderController::class, 'rejectOrder']);
    Route::post('/rider/orders/{order}/deliver', [RiderController::class, 'deliverOrder']);
});
