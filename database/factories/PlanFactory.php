<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Plan>
 */
class PlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->randomElement(['Basic', 'Standard', 'Premium', 'Enterprise']);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 0, 99.99),
            'billing_interval' => fake()->randomElement(['month', 'year']),
            'features' => [
                fake()->sentence(3),
                fake()->sentence(3),
                fake()->sentence(3),
            ],
            'stripe_price_id' => null,
            'is_active' => true,
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }

    /**
     * Free starter plan.
     */
    public function starter(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Starter',
            'slug' => 'starter',
            'description' => 'Perfect for personal projects',
            'price' => 0.00,
            'billing_interval' => 'month',
            'features' => [
                'Up to 5 projects',
                'Basic task management',
                'Calendar view',
                'Progress tracking',
            ],
            'stripe_price_id' => null,
            'is_active' => true,
            'sort_order' => 1,
        ]);
    }

    /**
     * Professional monthly plan.
     */
    public function professionalMonthly(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Professional',
            'slug' => 'professional-monthly',
            'description' => 'For power users & teams',
            'price' => 9.99,
            'billing_interval' => 'month',
            'features' => [
                'Unlimited projects',
                'Advanced task management',
                'Team collaboration',
                'Advanced analytics',
                'Third-party integrations',
                'Priority support',
            ],
            'stripe_price_id' => 'price_professional_monthly',
            'is_active' => true,
            'sort_order' => 2,
        ]);
    }

    /**
     * Professional yearly plan.
     */
    public function professionalYearly(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Professional',
            'slug' => 'professional-yearly',
            'description' => 'For power users & teams',
            'price' => 99.00,
            'billing_interval' => 'year',
            'features' => [
                'Unlimited projects',
                'Advanced task management',
                'Team collaboration',
                'Advanced analytics',
                'Third-party integrations',
                'Priority support',
            ],
            'stripe_price_id' => 'price_professional_yearly',
            'is_active' => true,
            'sort_order' => 3,
        ]);
    }

    /**
     * Inactive plan.
     */
    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_active' => false,
        ]);
    }
}
