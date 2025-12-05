<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all task lists
        $taskLists = TaskList::with('project')->get();

        // Get test user for created_by
        $testUser = User::where('email', 'test@example.com')->first();

        if (! $testUser) {
            $testUser = User::factory()->create([
                'email' => 'test@example.com',
                'name' => 'Test User',
            ]);
        }

        // Sample tasks for different statuses
        $sampleTasks = [
            'Backlog' => [
                ['title' => 'Research competitor features', 'priority' => 'low'],
                ['title' => 'Write technical documentation', 'priority' => 'medium'],
                ['title' => 'Plan user testing sessions', 'priority' => 'low'],
            ],
            'To Do' => [
                ['title' => 'Design homepage mockup', 'priority' => 'high'],
                ['title' => 'Set up CI/CD pipeline', 'priority' => 'medium'],
                ['title' => 'Create database schema', 'priority' => 'high'],
            ],
            'In Progress' => [
                ['title' => 'Implement user authentication', 'priority' => 'high'],
                ['title' => 'Build API endpoints', 'priority' => 'medium'],
            ],
            'Review' => [
                ['title' => 'Code review for login feature', 'priority' => 'high'],
                ['title' => 'Test payment integration', 'priority' => 'high'],
            ],
            'Done' => [
                ['title' => 'Project setup', 'priority' => 'medium', 'status' => 'completed'],
                ['title' => 'Install dependencies', 'priority' => 'low', 'status' => 'completed'],
                ['title' => 'Configure environment', 'priority' => 'medium', 'status' => 'completed'],
            ],
        ];

        foreach ($taskLists as $taskList) {
            $tasksForList = $sampleTasks[$taskList->name] ?? [];

            foreach ($tasksForList as $position => $taskData) {
                $status = match ($taskList->name) {
                    'In Progress' => 'in_progress',
                    'Done' => 'completed',
                    default => 'pending',
                };

                Task::create([
                    'task_list_id' => $taskList->id,
                    'created_by' => $taskList->project->user_id ?? $testUser->id,
                    'assigned_to' => fake()->optional(0.6)->randomElement([
                        $taskList->project->user_id ?? $testUser->id,
                    ]),
                    'title' => $taskData['title'],
                    'description' => fake()->optional(0.7)->paragraph(),
                    'priority' => $taskData['priority'],
                    'status' => $taskData['status'] ?? $status,
                    'position' => $position,
                    'due_date' => fake()->optional(0.5)->dateTimeBetween('now', '+1 month'),
                    'completed_at' => ($taskData['status'] ?? $status) === 'completed' ? now()->subDays(rand(1, 7)) : null,
                ]);
            }

            // Add some random tasks
            if (rand(0, 1)) {
                Task::factory()
                    ->count(rand(1, 3))
                    ->create([
                        'task_list_id' => $taskList->id,
                        'created_by' => $taskList->project->user_id ?? $testUser->id,
                    ]);
            }
        }
    }
}
