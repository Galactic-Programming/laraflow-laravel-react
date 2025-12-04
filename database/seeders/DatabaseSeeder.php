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
        // Seed plans first (required for subscriptions)
        // $this->call([
        //     PlanSeeder::class,
        // ]);

        // Create test user
        $testUser = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        // Seed projects with task lists and tasks for test user
        // $this->call([
        //     ProjectSeeder::class,
        //     SubscriptionSeeder::class,
        // ]);
    }
}
