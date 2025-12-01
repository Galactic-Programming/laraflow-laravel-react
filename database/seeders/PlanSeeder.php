<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        Plan::create([
            'name' => 'Starter',
            'slug' => 'starter',
            'description' => 'Perfect for getting started',
            'price' => 0.00,
            'billing_interval' => 'monthly',
            'features' => [
                'Basic features',
                'Email support',
                'Up to 3 projects',
            ],
            'is_active' => true,
            'sort_order' => 1,
        ]);

        Plan::create([
            'name' => 'Professional',
            'slug' => 'professional',
            'description' => 'For professionals who need more',
            'price' => 9.99,
            'billing_interval' => 'monthly',
            'features' => [
                'All Starter features',
                'Priority support',
                'Unlimited projects',
                'Advanced analytics',
                'API access',
            ],
            'is_active' => true,
            'sort_order' => 2,
        ]);
    }
}
