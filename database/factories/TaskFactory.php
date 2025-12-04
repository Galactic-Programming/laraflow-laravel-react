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
    private static array $taskTitles = [
        'Design user interface mockups',
        'Implement authentication system',
        'Write unit tests',
        'Review pull request',
        'Update documentation',
        'Fix navigation bug',
        'Optimize database queries',
        'Set up CI/CD pipeline',
        'Create API endpoints',
        'Refactor legacy code',
        'Add form validation',
        'Implement search functionality',
        'Configure deployment server',
        'Design database schema',
        'Create email templates',
        'Add error handling',
        'Implement file upload',
        'Set up monitoring',
        'Write integration tests',
        'Update dependencies',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(['pending', 'in_progress', 'completed', 'cancelled']);
        $createdAt = fake()->dateTimeBetween('-2 months', 'now');

        return [
            'task_list_id' => TaskList::factory(),
            'assigned_to' => null,
            'created_by' => User::factory(),
            'title' => fake()->randomElement(self::$taskTitles),
            'description' => fake()->optional(0.6)->paragraph(),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
            'status' => $status,
            'position' => fake()->numberBetween(0, 100),
            'due_date' => fake()->optional(0.5)->dateTimeBetween('now', '+2 months'),
            'completed_at' => $status === 'completed' ? fake()->dateTimeBetween($createdAt, 'now') : null,
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ];
    }

    /**
     * Set the task's assigned user.
     */
    public function assignedTo(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'assigned_to' => $user->id,
        ]);
    }

    /**
     * Set the task's creator.
     */
    public function createdBy(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'created_by' => $user->id,
        ]);
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

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'completed_at' => null,
        ]);
    }

    public function lowPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'low',
        ]);
    }

    public function mediumPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'medium',
        ]);
    }

    public function highPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'high',
        ]);
    }

    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'due_date' => fake()->dateTimeBetween('-2 weeks', '-1 day'),
            'completed_at' => null,
        ]);
    }

    public function withDueDate(): static
    {
        return $this->state(fn (array $attributes) => [
            'due_date' => fake()->dateTimeBetween('now', '+2 months'),
        ]);
    }
}
