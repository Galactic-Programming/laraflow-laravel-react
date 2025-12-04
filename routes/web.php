<?php

use App\Http\Controllers\Auth\SocialController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\PricingController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskListController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/terms', function () {
    return Inertia::render('auth/condition', ['type' => 'terms']);
})->name('terms');

Route::get('/privacy', function () {
    return Inertia::render('auth/condition', ['type' => 'privacy']);
})->name('privacy');

// Locale switching
Route::post('/locale/{locale}', [LocaleController::class, 'update'])->name('locale.update');

// Pricing page (accessible to all)
Route::get('pricing', [PricingController::class, 'index'])->name('pricing');

// Stripe payment success redirect (public route)
Route::get('payment/success', [PricingController::class, 'paymentSuccess'])->name('payment.success');

// Stripe webhook (no CSRF, no auth)
Route::post('webhooks/stripe', [StripeWebhookController::class, 'handle'])
    ->name('webhooks.stripe')
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::post('projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::put('projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::patch('projects/{project}/status', [ProjectController::class, 'updateStatus'])->name('projects.updateStatus');
    Route::delete('projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');

    // Task Lists (Kanban Columns)
    Route::post('projects/{project}/task-lists', [TaskListController::class, 'store'])->name('task-lists.store');
    Route::post('projects/{project}/task-lists/reorder', [TaskListController::class, 'reorder'])->name('task-lists.reorder');
    Route::put('projects/{project}/task-lists/{task_list}', [TaskListController::class, 'update'])->name('task-lists.update');
    Route::delete('projects/{project}/task-lists/{task_list}', [TaskListController::class, 'destroy'])->name('task-lists.destroy');

    // Tasks
    Route::post('projects/{project}/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::post('projects/{project}/tasks/reorder', [TaskController::class, 'reorder'])->name('tasks.reorder');
    Route::put('projects/{project}/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::patch('projects/{project}/tasks/{task}/complete', [TaskController::class, 'complete'])->name('tasks.complete');
    Route::patch('projects/{project}/tasks/{task}/move', [TaskController::class, 'move'])->name('tasks.move');
    Route::patch('projects/{project}/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.updateStatus');
    Route::post('projects/{project}/tasks/{task}/duplicate', [TaskController::class, 'duplicate'])->name('tasks.duplicate');
    Route::delete('projects/{project}/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
});

// Unified Social OAuth routes - works for both login (guest) and linking (auth)
Route::get('auth/{provider}/redirect', [SocialController::class, 'redirect'])
    ->whereIn('provider', ['google', 'github'])
    ->name('social.redirect');

Route::get('auth/{provider}/callback', [SocialController::class, 'callback'])
    ->whereIn('provider', ['google', 'github'])
    ->name('social.callback');

require __DIR__.'/settings.php';
