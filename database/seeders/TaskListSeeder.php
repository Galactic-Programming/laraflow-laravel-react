<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\TaskList;
use Illuminate\Database\Seeder;

class TaskListSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates default task lists for all projects that don't have any.
     */
    public function run(): void
    {
        $projectsWithoutLists = Project::doesntHave('taskLists')->get();

        foreach ($projectsWithoutLists as $project) {
            TaskList::factory()
                ->for($project)
                ->todo()
                ->create(['position' => 0]);

            TaskList::factory()
                ->for($project)
                ->inProgress()
                ->create(['position' => 1]);

            TaskList::factory()
                ->for($project)
                ->review()
                ->create(['position' => 2]);

            TaskList::factory()
                ->for($project)
                ->done()
                ->create(['position' => 3]);
        }
    }
}
