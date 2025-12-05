<?php

namespace Database\Seeders;

use App\Enums\BillingInterval;
use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Starter Plan (Free)
        Plan::updateOrCreate(
            ['slug' => 'starter'],
            [
                'name' => 'Starter',
                'description' => 'Perfect for personal projects and getting started',
                'price' => 0,
                'billing_interval' => BillingInterval::Month,
                'interval_count' => 1,
                'features' => [
                    'Up to 5 projects',
                    'Basic task management',
                    'Calendar view',
                    'Progress tracking',
                ],
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 1,
            ]
        );

        // Professional Monthly Plan
        Plan::updateOrCreate(
            ['slug' => 'professional-monthly'],
            [
                'name' => 'Professional',
                'description' => 'For power users and growing teams',
                'price' => 9.99,
                'billing_interval' => BillingInterval::Month,
                'interval_count' => 1,
                'features' => [
                    'Unlimited projects',
                    'Advanced task management',
                    'Team collaboration',
                    'Advanced analytics',
                    'Third-party integrations',
                    'Priority support',
                ],
                'stripe_price_id' => config('services.stripe.prices.professional_monthly'),
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 2,
            ]
        );

        // Professional Yearly Plan
        Plan::updateOrCreate(
            ['slug' => 'professional-yearly'],
            [
                'name' => 'Professional',
                'description' => 'Best value - Save 17% with annual billing',
                'price' => 99.00,
                'billing_interval' => BillingInterval::Year,
                'interval_count' => 1,
                'features' => [
                    'Unlimited projects',
                    'Advanced task management',
                    'Team collaboration',
                    'Advanced analytics',
                    'Third-party integrations',
                    'Priority support',
                ],
                'stripe_price_id' => config('services.stripe.prices.professional_yearly'),
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 3,
            ]
        );

        $this->command->info('Plans seeded successfully!');
    }
}
