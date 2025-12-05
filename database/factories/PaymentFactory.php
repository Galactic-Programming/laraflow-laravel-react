<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Payment;
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
     * The name of the factory's corresponding model.
     *
     * @var class-string<\Illuminate\Database\Eloquent\Model>
     */
    protected $model = Payment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $billingPeriodStart = now()->subDays(fake()->numberBetween(1, 30));
        $billingPeriodEnd = $billingPeriodStart->copy()->addMonth();

        return [
            'user_id' => User::factory(),
            'subscription_id' => Subscription::factory(),
            'plan_id' => Plan::factory(),
            'amount' => fake()->randomFloat(2, 9.99, 99.00),
            'currency' => 'USD',
            'status' => PaymentStatus::Completed,
            'type' => PaymentType::Initial,
            'payment_method' => 'stripe',
            'invoice_number' => fn () => Payment::generateInvoiceNumber(),
            'billing_period_start' => $billingPeriodStart,
            'billing_period_end' => $billingPeriodEnd,
            'paid_at' => now(),
        ];
    }

    /**
     * Indicate that the payment is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::Completed,
            'paid_at' => now(),
        ]);
    }

    /**
     * Indicate that the payment is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::Pending,
            'paid_at' => null,
        ]);
    }

    /**
     * Indicate that the payment failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::Failed,
            'paid_at' => null,
            'failure_message' => 'Card declined',
        ]);
    }

    /**
     * Indicate that the payment is a renewal.
     */
    public function renewal(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => PaymentType::Renewal,
        ]);
    }

    /**
     * Indicate that the payment is an initial payment.
     */
    public function initial(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => PaymentType::Initial,
        ]);
    }

    /**
     * Indicate that the payment has Stripe IDs.
     */
    public function withStripe(): static
    {
        return $this->state(fn (array $attributes) => [
            'stripe_payment_intent_id' => 'pi_'.fake()->regexify('[A-Za-z0-9]{24}'),
            'stripe_invoice_id' => 'in_'.fake()->regexify('[A-Za-z0-9]{24}'),
        ]);
    }

    /**
     * Indicate that the payment includes card information.
     */
    public function withCard(): static
    {
        return $this->state(fn (array $attributes) => [
            'card_brand' => fake()->randomElement(['visa', 'mastercard', 'amex']),
            'card_last_four' => fake()->numerify('####'),
        ]);
    }

    /**
     * Set a specific amount for the payment.
     */
    public function amount(float $amount): static
    {
        return $this->state(fn (array $attributes) => [
            'amount' => $amount,
        ]);
    }

    /**
     * Set monthly professional plan amount.
     */
    public function monthlyPlan(): static
    {
        return $this->state(fn (array $attributes) => [
            'amount' => 9.99,
        ]);
    }

    /**
     * Set yearly professional plan amount.
     */
    public function yearlyPlan(): static
    {
        return $this->state(fn (array $attributes) => [
            'amount' => 99.00,
        ]);
    }
}
