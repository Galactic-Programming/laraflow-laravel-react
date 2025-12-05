<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\TaskList;
use Illuminate\Database\Seeder;

class TaskListSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all projects
        $projects = Project::all();

        // Default task lists for each project (Kanban-style)
        $defaultTaskLists = [
            ['name' => 'Backlog', 'color' => '#6b7280', 'position' => 0],
            ['name' => 'To Do', 'color' => '#ef4444', 'position' => 1],
            ['name' => 'In Progress', 'color' => '#f59e0b', 'position' => 2],
            ['name' => 'Review', 'color' => '#8b5cf6', 'position' => 3],
            ['name' => 'Done', 'color' => '#22c55e', 'position' => 4],
        ];

        foreach ($projects as $project) {
            // Skip if project already has task lists
            if ($project->taskLists()->count() > 0) {
                continue;
            }

            foreach ($defaultTaskLists as $taskListData) {
                TaskList::create(array_merge($taskListData, [
                    'project_id' => $project->id,
                    'description' => "Tasks that are {$taskListData['name']}",
                ]));
            }
        }

        $this->command->info('Task lists seeded successfully!');
    }
}
