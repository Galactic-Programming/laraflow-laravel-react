<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\TaskList;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TaskList>
 */
class TaskListFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\Illuminate\Database\Eloquent\Model>
     */
    protected $model = TaskList::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'name' => fake()->randomElement(['To Do', 'In Progress', 'Review', 'Done', 'Backlog']),
            'description' => fake()->optional(0.5)->sentence(),
            'color' => fake()->hexColor(),
            'position' => fake()->numberBetween(0, 10),
        ];
    }

    /**
     * Create a "To Do" task list.
     */
    public function toDo(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'To Do',
            'color' => '#ef4444',
            'position' => 0,
        ]);
    }

    /**
     * Create an "In Progress" task list.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'In Progress',
            'color' => '#f59e0b',
            'position' => 1,
        ]);
    }

    /**
     * Create a "Review" task list.
     */
    public function review(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Review',
            'color' => '#8b5cf6',
            'position' => 2,
        ]);
    }

    /**
     * Create a "Done" task list.
     */
    public function done(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Done',
            'color' => '#22c55e',
            'position' => 3,
        ]);
    }

    /**
     * Set a specific position for the task list.
     */
    public function position(int $position): static
    {
        return $this->state(fn (array $attributes) => [
            'position' => $position,
        ]);
    }
}
