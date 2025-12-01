<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TaskList>
 */
class TaskListFactory extends Factory
{
    private static array $defaultLists = [
        ['name' => 'To Do', 'color' => '#6b7280'],
        ['name' => 'In Progress', 'color' => '#3b82f6'],
        ['name' => 'Review', 'color' => '#f59e0b'],
        ['name' => 'Done', 'color' => '#10b981'],
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $position = 0;

        return [
            'project_id' => Project::factory(),
            'name' => fake()->words(rand(1, 3), true),
            'description' => fake()->optional(0.3)->sentence(),
            'color' => fake()->hexColor(),
            'position' => $position++,
        ];
    }

    public function todo(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'To Do',
            'color' => '#6b7280',
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'In Progress',
            'color' => '#3b82f6',
        ]);
    }

    public function review(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Review',
            'color' => '#f59e0b',
        ]);
    }

    public function done(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Done',
            'color' => '#10b981',
        ]);
    }
}
