<?php

use App\Enums\BillingInterval;
use App\Enums\SubscriptionStatus;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;

beforeEach(function () {
    // Seed plans for tests
    Plan::create([
        'name' => 'Starter',
        'slug' => 'starter',
        'description' => 'Free plan',
        'price' => 0,
        'billing_interval' => BillingInterval::Month,
        'features' => ['Basic features'],
        'is_active' => true,
        'sort_order' => 1,
    ]);

    Plan::create([
        'name' => 'Professional',
        'slug' => 'professional-monthly',
        'description' => 'Monthly plan',
        'price' => 9.99,
        'billing_interval' => BillingInterval::Month,
        'features' => ['All features'],
        'is_active' => true,
        'sort_order' => 2,
    ]);

    Plan::create([
        'name' => 'Professional',
        'slug' => 'professional-yearly',
        'description' => 'Yearly plan',
        'price' => 99.00,
        'billing_interval' => BillingInterval::Year,
        'features' => ['All features'],
        'is_active' => true,
        'sort_order' => 3,
    ]);
});

it('shows pricing page to guests', function () {
    $response = $this->get('/pricing');

    $response->assertStatus(200);
    $response->assertInertia(
        fn ($page) => $page
            ->component('pricing')
            ->has('plans', 3)
            ->where('currentPlan', null)
            ->where('isSubscribed', false)
    );
});

it('shows pricing page with current plan for authenticated users', function () {
    $user = User::factory()->create();
    $plan = Plan::where('slug', 'professional-monthly')->first();

    Subscription::create([
        'user_id' => $user->id,
        'plan_id' => $plan->id,
        'status' => SubscriptionStatus::Active,
        'starts_at' => now(),
        'ends_at' => now()->addMonth(),
    ]);

    $response = $this->actingAs($user)->get('/pricing');

    $response->assertStatus(200);
    $response->assertInertia(
        fn ($page) => $page
            ->component('pricing')
            ->where('currentPlan', 'professional-monthly')
            ->where('isSubscribed', true)
    );
});

it('shows billing page for authenticated users', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/settings/billing');

    $response->assertStatus(200);
    $response->assertInertia(
        fn ($page) => $page
            ->component('settings/billing')
            ->where('subscription', null)
            ->has('payments', 0)
    );
});

it('shows subscription details on billing page', function () {
    $user = User::factory()->create();
    $plan = Plan::where('slug', 'professional-monthly')->first();

    Subscription::create([
        'user_id' => $user->id,
        'plan_id' => $plan->id,
        'status' => SubscriptionStatus::Active,
        'starts_at' => now(),
        'ends_at' => now()->addMonth(),
    ]);

    $response = $this->actingAs($user)->get('/settings/billing');

    $response->assertStatus(200);
    $response->assertInertia(
        fn ($page) => $page
            ->component('settings/billing')
            ->has('subscription')
            ->where('subscription.plan', 'Professional')
            ->where('subscription.status', SubscriptionStatus::Active->value)
    );
});

it('can cancel subscription', function () {
    $user = User::factory()->create();
    $plan = Plan::where('slug', 'professional-monthly')->first();

    $subscription = Subscription::create([
        'user_id' => $user->id,
        'plan_id' => $plan->id,
        'status' => SubscriptionStatus::Active,
        'starts_at' => now(),
        'ends_at' => now()->addMonth(),
    ]);

    $response = $this->actingAs($user)->post('/settings/billing/cancel');

    $response->assertRedirect();

    $subscription->refresh();
    expect($subscription->status)->toBe(SubscriptionStatus::Cancelled);
    expect($subscription->cancelled_at)->not->toBeNull();
});

it('can resume cancelled subscription', function () {
    $user = User::factory()->create();
    $plan = Plan::where('slug', 'professional-monthly')->first();

    $subscription = Subscription::create([
        'user_id' => $user->id,
        'plan_id' => $plan->id,
        'status' => SubscriptionStatus::Cancelled,
        'starts_at' => now(),
        'ends_at' => now()->addMonth(),
        'cancelled_at' => now(),
    ]);

    $response = $this->actingAs($user)->post('/settings/billing/resume');

    $response->assertRedirect();

    $subscription->refresh();
    expect($subscription->status)->toBe(SubscriptionStatus::Active);
    expect($subscription->cancelled_at)->toBeNull();
});

it('cannot resume expired subscription', function () {
    $user = User::factory()->create();
    $plan = Plan::where('slug', 'professional-monthly')->first();

    Subscription::create([
        'user_id' => $user->id,
        'plan_id' => $plan->id,
        'status' => SubscriptionStatus::Cancelled,
        'starts_at' => now()->subMonth(),
        'ends_at' => now()->subDay(), // Already expired
        'cancelled_at' => now()->subWeek(),
    ]);

    $response = $this->actingAs($user)->post('/settings/billing/resume');

    $response->assertRedirect();
    // Subscription should still be cancelled because ends_at is in the past
});

it('sets correct ends_at for monthly subscription', function () {
    $plan = Plan::where('slug', 'professional-monthly')->first();
    $startsAt = now();

    $expectedEndsAt = $startsAt->copy()->addMonth();
    $daysDiff = abs($startsAt->diffInDays($expectedEndsAt));

    expect($plan->billing_interval)->toBe(BillingInterval::Month);
    expect($daysDiff)->toBeGreaterThanOrEqual(28);
    expect($daysDiff)->toBeLessThanOrEqual(31);
});

it('sets correct ends_at for yearly subscription', function () {
    $plan = Plan::where('slug', 'professional-yearly')->first();
    $startsAt = now();

    $expectedEndsAt = $startsAt->copy()->addYear();
    $daysDiff = abs($startsAt->diffInDays($expectedEndsAt));

    expect($plan->billing_interval)->toBe(BillingInterval::Year);
    expect($daysDiff)->toBeGreaterThanOrEqual(365);
    expect($daysDiff)->toBeLessThanOrEqual(366);
});

it('cancelled subscription still has access until ends_at', function () {
    $user = User::factory()->create();
    $plan = Plan::where('slug', 'professional-monthly')->first();

    $subscription = Subscription::create([
        'user_id' => $user->id,
        'plan_id' => $plan->id,
        'status' => SubscriptionStatus::Cancelled,
        'starts_at' => now()->subWeek(),
        'ends_at' => now()->addWeeks(3), // Still has 3 weeks left
        'cancelled_at' => now(),
    ]);

    // Subscription should still have access
    expect($subscription->hasAccess())->toBeTrue();
    expect($subscription->isProfessional())->toBeTrue();

    // User should still be professional
    $user->refresh();
    expect($user->isProfessional())->toBeTrue();
    expect($user->hasPremiumAccess())->toBeTrue();
});

it('cancelled subscription loses access after ends_at', function () {
    $user = User::factory()->create();
    $plan = Plan::where('slug', 'professional-monthly')->first();

    $subscription = Subscription::create([
        'user_id' => $user->id,
        'plan_id' => $plan->id,
        'status' => SubscriptionStatus::Cancelled,
        'starts_at' => now()->subMonth(),
        'ends_at' => now()->subDay(), // Already expired
        'cancelled_at' => now()->subWeek(),
    ]);

    // Subscription should NOT have access
    expect($subscription->hasAccess())->toBeFalse();
    expect($subscription->isProfessional())->toBeFalse();

    // User should NOT be professional
    $user->refresh();
    expect($user->isProfessional())->toBeFalse();
});

it('shows cancelled subscription on billing page with access info', function () {
    $user = User::factory()->create();
    $plan = Plan::where('slug', 'professional-monthly')->first();

    Subscription::create([
        'user_id' => $user->id,
        'plan_id' => $plan->id,
        'status' => SubscriptionStatus::Cancelled,
        'starts_at' => now()->subWeek(),
        'ends_at' => now()->addWeeks(3),
        'cancelled_at' => now(),
    ]);

    $response = $this->actingAs($user)->get('/settings/billing');

    $response->assertStatus(200);
    $response->assertInertia(
        fn ($page) => $page
            ->component('settings/billing')
            ->has('subscription')
            ->where('subscription.status', SubscriptionStatus::Cancelled->value)
            ->where('subscription.plan', 'Professional')
    );
});
