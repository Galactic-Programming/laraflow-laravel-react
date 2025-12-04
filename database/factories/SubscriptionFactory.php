<?php

namespace Database\Factories;

use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsAt = fake()->dateTimeBetween('-6 months', 'now');

        return [
            'user_id' => User::factory(),
            'plan_id' => Plan::factory(),
            'status' => 'active',
            'stripe_subscription_id' => 'sub_' . fake()->unique()->regexify('[A-Za-z0-9]{24}'),
            'stripe_customer_id' => 'cus_' . fake()->unique()->regexify('[A-Za-z0-9]{14}'),
            'starts_at' => $startsAt,
            'ends_at' => null,
            'cancelled_at' => null,
        ];
    }

    /**
     * Active subscription.
     */
    public function active(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'active',
            'ends_at' => null,
            'cancelled_at' => null,
        ]);
    }

    /**
     * Cancelled subscription that still has access until ends_at.
     */
    public function cancelled(): static
    {
        $cancelledAt = fake()->dateTimeBetween('-1 month', 'now');

        return $this->state(fn(array $attributes) => [
            'status' => 'cancelled',
            'cancelled_at' => $cancelledAt,
            'ends_at' => fake()->dateTimeBetween('now', '+1 month'),
        ]);
    }

    /**
     * Expired subscription.
     */
    public function expired(): static
    {
        $endsAt = fake()->dateTimeBetween('-2 months', '-1 day');

        return $this->state(fn(array $attributes) => [
            'status' => 'expired',
            'ends_at' => $endsAt,
            'cancelled_at' => null,
        ]);
    }

    /**
     * Past due subscription (payment failed).
     */
    public function pastDue(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'past_due',
            'ends_at' => null,
            'cancelled_at' => null,
        ]);
    }

    /**
     * Free plan subscription (no Stripe IDs).
     */
    public function free(): static
    {
        return $this->state(fn(array $attributes) => [
            'stripe_subscription_id' => null,
            'stripe_customer_id' => null,
        ]);
    }

    /**
     * Monthly subscription.
     */
    public function monthly(): static
    {
        $startsAt = fake()->dateTimeBetween('-1 month', 'now');

        return $this->state(fn(array $attributes) => [
            'starts_at' => $startsAt,
        ]);
    }

    /**
     * Yearly subscription.
     */
    public function yearly(): static
    {
        $startsAt = fake()->dateTimeBetween('-1 year', 'now');

        return $this->state(fn(array $attributes) => [
            'starts_at' => $startsAt,
        ]);
    }
}
