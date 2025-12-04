<?php

namespace Database\Factories;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(['completed', 'pending', 'failed']);
        $paidAt = $status === 'completed' ? fake()->dateTimeBetween('-6 months', 'now') : null;

        return [
            'user_id' => User::factory(),
            'subscription_id' => Subscription::factory(),
            'plan_id' => Plan::factory(),
            'amount' => fake()->randomFloat(2, 9.99, 99.00),
            'currency' => 'USD',
            'status' => $status,
            'payment_method' => fake()->randomElement(['card', 'paypal', 'bank_transfer']),
            'stripe_payment_intent_id' => 'pi_' . fake()->unique()->regexify('[A-Za-z0-9]{24}'),
            'stripe_invoice_id' => 'in_' . fake()->unique()->regexify('[A-Za-z0-9]{24}'),
            'metadata' => [
                'card_last4' => fake()->numerify('####'),
                'card_brand' => fake()->randomElement(['visa', 'mastercard', 'amex']),
            ],
            'paid_at' => $paidAt,
        ];
    }

    /**
     * Completed payment.
     */
    public function completed(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'completed',
            'paid_at' => fake()->dateTimeBetween('-6 months', 'now'),
        ]);
    }

    /**
     * Pending payment.
     */
    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'pending',
            'paid_at' => null,
        ]);
    }

    /**
     * Failed payment.
     */
    public function failed(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'failed',
            'paid_at' => null,
            'metadata' => [
                'error' => 'Card declined',
                'error_code' => 'card_declined',
            ],
        ]);
    }

    /**
     * Refunded payment.
     */
    public function refunded(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'refunded',
            'paid_at' => fake()->dateTimeBetween('-6 months', '-1 month'),
            'metadata' => [
                'refunded_at' => fake()->dateTimeBetween('-1 month', 'now')->format('Y-m-d H:i:s'),
                'refund_reason' => 'Customer requested',
            ],
        ]);
    }

    /**
     * Monthly payment amount.
     */
    public function monthlyAmount(): static
    {
        return $this->state(fn(array $attributes) => [
            'amount' => 9.99,
        ]);
    }

    /**
     * Yearly payment amount.
     */
    public function yearlyAmount(): static
    {
        return $this->state(fn(array $attributes) => [
            'amount' => 99.00,
        ]);
    }
}
