<?php

namespace Database\Factories;

use App\Enums\BillingInterval;
use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Plan>
 */
class PlanFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\Illuminate\Database\Eloquent\Model>
     */
    protected $model = Plan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->randomElement(['Starter', 'Professional', 'Enterprise']);
        $billingInterval = fake()->randomElement(BillingInterval::cases());

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.$billingInterval->value,
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 0, 99),
            'billing_interval' => $billingInterval,
            'interval_count' => 1,
            'features' => fake()->sentences(5),
            'is_active' => true,
            'is_featured' => fake()->boolean(30),
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }

    /**
     * Indicate that the plan is free (Starter).
     */
    public function free(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Starter',
            'slug' => 'starter',
            'price' => 0,
            'billing_interval' => BillingInterval::Month,
            'is_featured' => false,
        ]);
    }

    /**
     * Indicate that the plan is a monthly professional plan.
     */
    public function professionalMonthly(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Professional',
            'slug' => 'professional-monthly',
            'price' => 9.99,
            'billing_interval' => BillingInterval::Month,
            'is_featured' => true,
        ]);
    }

    /**
     * Indicate that the plan is a yearly professional plan.
     */
    public function professionalYearly(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Professional',
            'slug' => 'professional-yearly',
            'price' => 99.00,
            'billing_interval' => BillingInterval::Year,
            'is_featured' => false,
        ]);
    }

    /**
     * Indicate that the plan is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the plan is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }
}
