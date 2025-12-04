<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates sample tasks for all task lists that don't have any.
     */
    public function run(): void
    {
        $taskListsWithoutTasks = TaskList::doesntHave('tasks')->with('project.user')->get();

        foreach ($taskListsWithoutTasks as $taskList) {
            $user = $taskList->project->user;
            $taskCount = rand(2, 5);

            // Determine task status based on list name
            $status = match (strtolower($taskList->name)) {
                'to do' => 'pending',
                'in progress' => 'in_progress',
                'review' => 'pending',
                'done' => 'completed',
                default => 'pending',
            };

            Task::factory($taskCount)
                ->for($taskList)
                ->createdBy($user)
                ->state(['status' => $status])
                ->when($status === 'completed', fn($factory) => $factory->completed())
                ->sequence(fn($sequence) => ['position' => $sequence->index])
                ->create();
        }
    }
}
