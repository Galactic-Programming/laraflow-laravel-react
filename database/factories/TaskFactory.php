<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\Illuminate\Database\Eloquent\Model>
     */
    protected $model = Task::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'task_list_id' => TaskList::factory(),
            'assigned_to' => fake()->optional(0.7)->randomElement([User::factory()]),
            'created_by' => User::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->optional(0.6)->paragraph(),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
            'status' => 'pending',
            'position' => fake()->numberBetween(0, 20),
            'due_date' => fake()->optional(0.5)->dateTimeBetween('now', '+2 months'),
            'completed_at' => null,
        ];
    }

    /**
     * Indicate that the task is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'completed_at' => null,
        ]);
    }

    /**
     * Indicate that the task is in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'completed_at' => null,
        ]);
    }

    /**
     * Indicate that the task is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    /**
     * Indicate that the task is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'completed_at' => null,
        ]);
    }

    /**
     * Indicate that the task has low priority.
     */
    public function lowPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'low',
        ]);
    }

    /**
     * Indicate that the task has medium priority.
     */
    public function mediumPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'medium',
        ]);
    }

    /**
     * Indicate that the task has high priority.
     */
    public function highPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'high',
        ]);
    }

    /**
     * Indicate that the task is overdue.
     */
    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'due_date' => fake()->dateTimeBetween('-1 month', '-1 day'),
            'status' => 'pending',
            'completed_at' => null,
        ]);
    }

    /**
     * Indicate that the task has no due date.
     */
    public function noDueDate(): static
    {
        return $this->state(fn (array $attributes) => [
            'due_date' => null,
        ]);
    }

    /**
     * Indicate that the task is unassigned.
     */
    public function unassigned(): static
    {
        return $this->state(fn (array $attributes) => [
            'assigned_to' => null,
        ]);
    }

    /**
     * Set a specific position for the task.
     */
    public function position(int $position): static
    {
        return $this->state(fn (array $attributes) => [
            'position' => $position,
        ]);
    }
}
