<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;

class SubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            return;
        }

        $starterPlan = Plan::where('slug', 'starter')->first();
        $professionalMonthlyPlan = Plan::where('slug', 'professional-monthly')->first();
        $professionalYearlyPlan = Plan::where('slug', 'professional-yearly')->first();

        foreach ($users as $index => $user) {
            // Skip if user already has a subscription
            if ($user->subscriptions()->exists()) {
                continue;
            }

            // First user gets professional monthly (for testing premium features)
            if ($index === 0 && $professionalMonthlyPlan) {
                $subscription = Subscription::factory()
                    ->for($user)
                    ->for($professionalMonthlyPlan)
                    ->active()
                    ->create([
                        'starts_at' => now()->subMonth(),
                    ]);

                // Create a completed payment for this subscription
                Payment::factory()
                    ->for($user)
                    ->for($subscription)
                    ->for($professionalMonthlyPlan)
                    ->completed()
                    ->monthlyAmount()
                    ->create();

                continue;
            }

            // Second user gets professional yearly
            if ($index === 1 && $professionalYearlyPlan) {
                $subscription = Subscription::factory()
                    ->for($user)
                    ->for($professionalYearlyPlan)
                    ->active()
                    ->yearly()
                    ->create();

                Payment::factory()
                    ->for($user)
                    ->for($subscription)
                    ->for($professionalYearlyPlan)
                    ->completed()
                    ->yearlyAmount()
                    ->create();

                continue;
            }

            // Third user gets cancelled subscription (still has access)
            if ($index === 2 && $professionalMonthlyPlan) {
                $subscription = Subscription::factory()
                    ->for($user)
                    ->for($professionalMonthlyPlan)
                    ->cancelled()
                    ->create();

                Payment::factory()
                    ->for($user)
                    ->for($subscription)
                    ->for($professionalMonthlyPlan)
                    ->completed()
                    ->monthlyAmount()
                    ->create();

                continue;
            }

            // Remaining users stay on free starter plan (no subscription record needed)
            // Or optionally create a free subscription
            if ($starterPlan) {
                Subscription::factory()
                    ->for($user)
                    ->for($starterPlan)
                    ->free()
                    ->active()
                    ->create();
            }
        }
    }
}
