<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the test user or create one
        $user = User::where('email', 'test@example.com')->first();

        if (! $user) {
            $user = User::factory()->create([
                'email' => 'test@example.com',
                'name' => 'Test User',
            ]);
        }

        // Create sample projects for the test user
        $projects = [
            [
                'name' => 'Website Redesign',
                'description' => 'Complete overhaul of the company website with modern design and improved UX.',
                'color' => '#3b82f6',
                'icon' => 'globe',
                'status' => 'active',
                'visibility' => 'private',
                'due_date' => now()->addMonths(2),
            ],
            [
                'name' => 'Mobile App Development',
                'description' => 'Build a cross-platform mobile application for iOS and Android.',
                'color' => '#10b981',
                'icon' => 'smartphone',
                'status' => 'active',
                'visibility' => 'private',
                'due_date' => now()->addMonths(4),
            ],
            [
                'name' => 'Marketing Campaign Q1',
                'description' => 'Plan and execute Q1 marketing initiatives across all channels.',
                'color' => '#f59e0b',
                'icon' => 'megaphone',
                'status' => 'completed',
                'visibility' => 'public',
                'due_date' => now()->subWeeks(2),
            ],
            [
                'name' => 'API Integration',
                'description' => 'Integrate third-party APIs for payment processing and analytics.',
                'color' => '#8b5cf6',
                'icon' => 'code',
                'status' => 'active',
                'visibility' => 'private',
                'due_date' => now()->addWeeks(3),
            ],
            [
                'name' => 'Legacy System Migration',
                'description' => 'Migrate data and services from legacy system to new infrastructure.',
                'color' => '#ef4444',
                'icon' => 'database',
                'status' => 'archived',
                'visibility' => 'private',
                'due_date' => null,
            ],
        ];

        foreach ($projects as $projectData) {
            Project::create(array_merge($projectData, ['user_id' => $user->id]));
        }

        // Create some random projects for other users
        Project::factory()
            ->count(10)
            ->create();

        $this->command->info('Projects seeded successfully!');
    }
}
