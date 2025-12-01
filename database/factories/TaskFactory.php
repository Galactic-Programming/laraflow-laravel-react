<?php

namespace Database\Factories;

use App\Models\TaskList;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(['pending', 'in_progress', 'completed', 'cancelled']);

        return [
            'task_list_id' => TaskList::factory(),
            'assigned_to' => fake()->optional(0.7)->randomElement(User::pluck('id')->toArray() ?: [null]),
            'created_by' => User::factory(),
            'title' => fake()->sentence(rand(3, 8)),
            'description' => fake()->optional(0.6)->paragraph(),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
            'status' => $status,
            'position' => fake()->numberBetween(0, 100),
            'due_date' => fake()->optional(0.5)->dateTimeBetween('now', '+2 months'),
            'completed_at' => $status === 'completed' ? fake()->dateTimeBetween('-1 month', 'now') : null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'completed_at' => null,
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'completed_at' => null,
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'completed_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ]);
    }

    public function highPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'high',
        ]);
    }
}
