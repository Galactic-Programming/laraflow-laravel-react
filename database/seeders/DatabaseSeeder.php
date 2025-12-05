<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test user first
        $testUser = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        // Seed in order of dependencies
        $this->call([
            // Plans must be seeded first (required for subscriptions)
            PlanSeeder::class,

            // Projects and related data
            ProjectSeeder::class,
            TaskListSeeder::class,
            TaskSeeder::class,

            // Subscriptions and payments
            SubscriptionSeeder::class,
        ]);
    }
}
