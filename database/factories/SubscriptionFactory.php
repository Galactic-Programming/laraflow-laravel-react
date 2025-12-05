<?php

namespace Database\Factories;

use App\Enums\SubscriptionStatus;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\Illuminate\Database\Eloquent\Model>
     */
    protected $model = Subscription::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsAt = fake()->dateTimeBetween('-1 month', 'now');

        return [
            'user_id' => User::factory(),
            'plan_id' => Plan::factory(),
            'status' => SubscriptionStatus::Active,
            'starts_at' => $startsAt,
            'ends_at' => Carbon::parse($startsAt)->addMonth(),
            'auto_renew' => true,
        ];
    }

    /**
     * Indicate that the subscription is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SubscriptionStatus::Active,
            'starts_at' => now()->subDays(15),
            'ends_at' => now()->addDays(15),
            'cancelled_at' => null,
        ]);
    }

    /**
     * Indicate that the subscription is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SubscriptionStatus::Cancelled,
            'cancelled_at' => now(),
            'cancellation_reason' => fake()->sentence(),
        ]);
    }

    /**
     * Indicate that the subscription is cancelled but still has access (ends in future).
     */
    public function cancelledWithAccess(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SubscriptionStatus::Cancelled,
            'cancelled_at' => now()->subDays(5),
            'ends_at' => now()->addDays(10),
            'cancellation_reason' => fake()->sentence(),
        ]);
    }

    /**
     * Indicate that the subscription is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SubscriptionStatus::Expired,
            'starts_at' => now()->subMonths(2),
            'ends_at' => now()->subDay(),
        ]);
    }

    /**
     * Indicate that the subscription is past due.
     */
    public function pastDue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SubscriptionStatus::PastDue,
        ]);
    }

    /**
     * Indicate that the subscription has auto-renew disabled.
     */
    public function noAutoRenew(): static
    {
        return $this->state(fn (array $attributes) => [
            'auto_renew' => false,
        ]);
    }

    /**
     * Indicate that the subscription ends soon (within 3 days).
     */
    public function endingSoon(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SubscriptionStatus::Active,
            'starts_at' => now()->subDays(27),
            'ends_at' => now()->addDays(3),
        ]);
    }

    /**
     * Indicate that the subscription is in grace period.
     */
    public function inGracePeriod(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SubscriptionStatus::Cancelled,
            'cancelled_at' => now()->subDays(3),
            'ends_at' => now()->subDay(),
            'grace_period_ends_at' => now()->addDays(4),
        ]);
    }

    /**
     * Indicate that the subscription is yearly.
     */
    public function yearly(): static
    {
        return $this->state(fn (array $attributes) => [
            'starts_at' => now()->subMonths(6),
            'ends_at' => now()->addMonths(6),
        ]);
    }

    /**
     * Indicate that the subscription has Stripe IDs.
     */
    public function withStripe(): static
    {
        return $this->state(fn (array $attributes) => [
            'stripe_subscription_id' => 'sub_'.fake()->regexify('[A-Za-z0-9]{14}'),
            'stripe_customer_id' => 'cus_'.fake()->regexify('[A-Za-z0-9]{14}'),
        ]);
    }
}
