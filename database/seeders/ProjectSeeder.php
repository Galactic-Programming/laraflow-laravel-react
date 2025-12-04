<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Sample project names for realistic data.
     */
    private array $projectNames = [
        'Website Redesign',
        'Mobile App Development',
        'Marketing Campaign',
        'Product Launch',
        'Customer Portal',
        'API Integration',
        'Documentation Update',
        'Performance Optimization',
        'Security Audit',
        'Data Migration',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $users = User::factory(3)->create();
        }

        foreach ($users as $user) {
            // Create 2-4 projects per user
            $projectCount = rand(2, 4);
            $projectNames = fake()->randomElements($this->projectNames, $projectCount);

            foreach ($projectNames as $position => $projectName) {
                $project = Project::factory()
                    ->for($user)
                    ->active()
                    ->create([
                        'name' => $projectName,
                        'description' => "Project for {$projectName} - " . fake()->sentence(),
                    ]);

                $this->createTaskListsWithTasks($project, $user);
            }

            // Create one archived project
            $archivedProject = Project::factory()
                ->for($user)
                ->archived()
                ->create([
                    'name' => 'Archived Project',
                    'description' => 'This project has been archived.',
                ]);

            $this->createTaskListsWithTasks($archivedProject, $user, true);
        }
    }

    /**
     * Create task lists with tasks for a project.
     */
    private function createTaskListsWithTasks(Project $project, User $user, bool $isArchived = false): void
    {
        // Create default task lists
        $todoList = TaskList::factory()
            ->for($project)
            ->todo()
            ->create(['position' => 0]);

        $inProgressList = TaskList::factory()
            ->for($project)
            ->inProgress()
            ->create(['position' => 1]);

        $reviewList = TaskList::factory()
            ->for($project)
            ->review()
            ->create(['position' => 2]);

        $doneList = TaskList::factory()
            ->for($project)
            ->done()
            ->create(['position' => 3]);

        if ($isArchived) {
            // Archived projects have mostly completed tasks
            Task::factory(rand(1, 2))
                ->for($todoList)
                ->createdBy($user)
                ->pending()
                ->create();

            Task::factory(rand(5, 8))
                ->for($doneList)
                ->createdBy($user)
                ->completed()
                ->create();
        } else {
            // Active projects have a mix of task statuses
            // To Do list - pending tasks
            Task::factory(rand(3, 6))
                ->for($todoList)
                ->createdBy($user)
                ->pending()
                ->sequence(fn($sequence) => ['position' => $sequence->index])
                ->create();

            // In Progress list - tasks being worked on
            Task::factory(rand(1, 3))
                ->for($inProgressList)
                ->createdBy($user)
                ->inProgress()
                ->sequence(fn($sequence) => ['position' => $sequence->index])
                ->create();

            // Review list - tasks pending review
            Task::factory(rand(0, 2))
                ->for($reviewList)
                ->createdBy($user)
                ->pending()
                ->sequence(fn($sequence) => ['position' => $sequence->index])
                ->create();

            // Done list - completed tasks
            Task::factory(rand(2, 5))
                ->for($doneList)
                ->createdBy($user)
                ->completed()
                ->sequence(fn($sequence) => ['position' => $sequence->index])
                ->create();

            // Add some high priority tasks
            Task::factory(rand(1, 2))
                ->for($todoList)
                ->createdBy($user)
                ->pending()
                ->highPriority()
                ->withDueDate()
                ->create();

            // Add one overdue task for realism
            if (fake()->boolean(30)) {
                Task::factory()
                    ->for($todoList)
                    ->createdBy($user)
                    ->overdue()
                    ->create();
            }
        }
    }
}
