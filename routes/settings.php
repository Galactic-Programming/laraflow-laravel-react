<?php

use App\Http\Controllers\PricingController;
use App\Http\Controllers\Settings\AvatarController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SocialConnectionsController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    // Social connections management
    Route::get('settings/connections', [SocialConnectionsController::class, 'show'])
        ->name('connections.show');
    Route::delete('settings/connections/{provider}', [SocialConnectionsController::class, 'destroy'])
        ->whereIn('provider', ['google', 'github'])
        ->name('connections.destroy');

    // Avatar management
    Route::patch('settings/avatar', [AvatarController::class, 'update'])
        ->name('avatar.update');
    Route::delete('settings/avatar', [AvatarController::class, 'destroy'])
        ->name('avatar.destroy');

    // Billing management
    Route::get('settings/billing', [PricingController::class, 'billing'])
        ->name('billing.show');
    Route::post('settings/billing/cancel', [PricingController::class, 'cancelSubscription'])
        ->name('billing.cancel');
    Route::post('settings/billing/resume', [PricingController::class, 'resumeSubscription'])
        ->name('billing.resume');
});
