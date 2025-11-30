<?php

use App\Http\Controllers\Auth\SocialLinkController;
use App\Http\Controllers\Auth\SocialLoginController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});


// Social authentication routes
// Redirect is only for guests, but the callback must accept both guests and authenticated
// users because we also reuse it for the account linking flow.
Route::middleware(['guest'])->group(function () {
    Route::get('auth/{provider}/redirect', [SocialLoginController::class, 'redirect'])
        ->whereIn('provider', ['google', 'github'])
        ->name('social.redirect');
});

// Shared OAuth callback for both login (guest) and linking (auth)
Route::get('auth/{provider}/callback', [SocialLoginController::class, 'callback'])
    ->whereIn('provider', ['google', 'github'])
    ->name('social.callback');

// Social linking routes (for authenticated users) — under /auth/{provider}/link
Route::middleware(['auth'])->group(function () {
    Route::get('auth/{provider}/link', [SocialLinkController::class, 'redirect'])
        ->whereIn('provider', ['google', 'github'])
        ->name('social.link.redirect');
});

require __DIR__ . '/settings.php';
