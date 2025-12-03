<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        // Free Starter Plan
        Plan::updateOrCreate(
            ['slug' => 'starter'],
            [
                'name' => 'Starter',
                'description' => 'Perfect for personal projects',
                'price' => 0.00,
                'billing_interval' => 'month',
                'features' => [
                    'Up to 5 projects',
                    'Basic task management',
                    'Calendar view',
                    'Progress tracking',
                ],
                'stripe_price_id' => null, // Free plan, no Stripe price
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        // Professional Monthly Plan
        Plan::updateOrCreate(
            ['slug' => 'professional-monthly'],
            [
                'name' => 'Professional',
                'description' => 'For power users & teams',
                'price' => 9.99,
                'billing_interval' => 'month',
                'features' => [
                    'Unlimited projects',
                    'Advanced task management',
                    'Team collaboration',
                    'Advanced analytics',
                    'Third-party integrations',
                    'Priority support',
                ],
                // Replace with your actual Stripe Price ID after creating it
                'stripe_price_id' => env('STRIPE_PRICE_PROFESSIONAL_MONTHLY'),
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        // Professional Yearly Plan
        Plan::updateOrCreate(
            ['slug' => 'professional-yearly'],
            [
                'name' => 'Professional',
                'description' => 'For power users & teams',
                'price' => 99.00,
                'billing_interval' => 'year',
                'features' => [
                    'Unlimited projects',
                    'Advanced task management',
                    'Team collaboration',
                    'Advanced analytics',
                    'Third-party integrations',
                    'Priority support',
                ],
                // Replace with your actual Stripe Price ID after creating it
                'stripe_price_id' => env('STRIPE_PRICE_PROFESSIONAL_YEARLY'),
                'is_active' => true,
                'sort_order' => 3,
            ]
        );
    }
}
