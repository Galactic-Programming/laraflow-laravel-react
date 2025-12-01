<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
        $icons = ['folder', 'briefcase', 'rocket', 'star', 'heart', 'zap', 'target'];

        return [
            'user_id' => User::factory(),
            'name' => fake()->words(rand(2, 4), true),
            'description' => fake()->optional(0.7)->paragraph(),
            'color' => fake()->randomElement($colors),
            'icon' => fake()->optional(0.5)->randomElement($icons),
            'status' => fake()->randomElement(['active', 'archived', 'completed']),
            'visibility' => fake()->randomElement(['private', 'public']),
            'due_date' => fake()->optional(0.6)->dateTimeBetween('now', '+3 months'),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'archived',
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }
}
