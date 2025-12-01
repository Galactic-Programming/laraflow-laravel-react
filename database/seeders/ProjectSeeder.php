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
            $projects = Project::factory(rand(2, 4))
                ->for($user)
                ->active()
                ->create();

            foreach ($projects as $project) {
                // Create default task lists for each project
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

                // Create tasks for each list
                Task::factory(rand(3, 6))
                    ->for($todoList)
                    ->pending()
                    ->create(['created_by' => $user->id]);

                Task::factory(rand(1, 3))
                    ->for($inProgressList)
                    ->inProgress()
                    ->create(['created_by' => $user->id]);

                Task::factory(rand(0, 2))
                    ->for($reviewList)
                    ->pending()
                    ->create(['created_by' => $user->id]);

                Task::factory(rand(2, 5))
                    ->for($doneList)
                    ->completed()
                    ->create(['created_by' => $user->id]);
            }
        }
    }
}
