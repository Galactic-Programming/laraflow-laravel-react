<?php

use App\Models\Project;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $defaultColumns = [
            ['name' => 'Pending', 'color' => '#6b7280', 'position' => 0],
            ['name' => 'In Progress', 'color' => '#3b82f6', 'position' => 1],
            ['name' => 'Completed', 'color' => '#f59e0b', 'position' => 2],
            ['name' => 'Cancelled', 'color' => '#10b981', 'position' => 3],
        ];

        // Get projects without any task lists
        $projectsWithoutLists = Project::whereDoesntHave('taskLists')->get();

        foreach ($projectsWithoutLists as $project) {
            foreach ($defaultColumns as $column) {
                $project->taskLists()->create($column);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Nothing to reverse - we don't want to delete user's task lists
    }
};
