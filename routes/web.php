<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\StorefrontController;
use Illuminate\Support\Facades\Route;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;

Route::get('/', [StorefrontController::class, 'home'])->name('home');
Route::get('/shop', [StorefrontController::class, 'shop'])->name('shop');
Route::get('/shop/{product:slug}', [StorefrontController::class, 'show'])->name('products.show');

Route::get('/cart', [CartController::class, 'show'])->name('cart.show');
Route::post('/cart/{product}', [CartController::class, 'add'])->name('cart.add');
Route::delete('/cart/{key}', [CartController::class, 'remove'])->name('cart.remove');
Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');

Route::middleware(['auth', ValidateSessionWithWorkOS::class])->group(function () {
    Route::get('/account/orders', [AccountController::class, 'orders'])->name('account.orders');
    Route::post('/checkout/payfast', CheckoutController::class)->name('checkout.payfast');

    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('index');
        Route::post('/products', [AdminController::class, 'storeProduct'])->name('products.store');
        Route::post('/products/{product}/variants', [AdminController::class, 'storeVariant'])->name('variants.store');
        Route::patch('/products/{product}', [AdminController::class, 'updateProduct'])->name('products.update');
        Route::post('/coupons', [AdminController::class, 'storeCoupon'])->name('coupons.store');
        Route::patch('/orders/{order}', [AdminController::class, 'updateOrder'])->name('orders.update');
    });

    Route::redirect('/dashboard', '/account/orders')->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
