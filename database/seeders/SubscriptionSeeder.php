<?php

namespace Database\Seeders;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Enums\SubscriptionStatus;
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
        // Get the test user
        $testUser = User::where('email', 'test@example.com')->first();

        if (! $testUser) {
            $testUser = User::factory()->create([
                'email' => 'test@example.com',
                'name' => 'Test User',
            ]);
        }

        // Get plans
        $monthlyPlan = Plan::where('slug', 'professional-monthly')->first();
        $yearlyPlan = Plan::where('slug', 'professional-yearly')->first();

        if (! $monthlyPlan || ! $yearlyPlan) {
            $this->command->warn('Plans not found. Run PlanSeeder first.');

            return;
        }

        // Create an active subscription for the test user
        $subscription = Subscription::firstOrCreate(
            ['user_id' => $testUser->id],
            [
                'plan_id' => $monthlyPlan->id,
                'status' => SubscriptionStatus::Active,
                'starts_at' => now()->subDays(15),
                'ends_at' => now()->addDays(15),
                'auto_renew' => true,
            ]
        );

        // Create initial payment for the subscription
        Payment::firstOrCreate(
            [
                'subscription_id' => $subscription->id,
                'type' => PaymentType::Initial,
            ],
            [
                'user_id' => $testUser->id,
                'plan_id' => $monthlyPlan->id,
                'amount' => $monthlyPlan->price,
                'currency' => 'USD',
                'status' => PaymentStatus::Completed,
                'payment_method' => 'stripe',
                'invoice_number' => Payment::generateInvoiceNumber(),
                'billing_period_start' => $subscription->starts_at,
                'billing_period_end' => $subscription->ends_at,
                'paid_at' => $subscription->starts_at,
            ]
        );

        // Create some sample subscriptions with different statuses using factories
        $users = User::factory()->count(5)->create();

        // Active yearly subscription
        $yearlySubscription = Subscription::factory()
            ->for($users[0])
            ->for($yearlyPlan)
            ->yearly()
            ->create([
                'status' => SubscriptionStatus::Active,
            ]);

        Payment::factory()
            ->for($users[0])
            ->for($yearlySubscription)
            ->for($yearlyPlan)
            ->yearlyPlan()
            ->create();

        // Cancelled subscription (still has access)
        $cancelledSubscription = Subscription::factory()
            ->for($users[1])
            ->for($monthlyPlan)
            ->cancelledWithAccess()
            ->create();

        Payment::factory()
            ->for($users[1])
            ->for($cancelledSubscription)
            ->for($monthlyPlan)
            ->monthlyPlan()
            ->create();

        // Expired subscription
        Subscription::factory()
            ->for($users[2])
            ->for($monthlyPlan)
            ->expired()
            ->create();

        // Past due subscription
        Subscription::factory()
            ->for($users[3])
            ->for($monthlyPlan)
            ->pastDue()
            ->create();

        // Subscription ending soon
        $endingSoonSubscription = Subscription::factory()
            ->for($users[4])
            ->for($monthlyPlan)
            ->endingSoon()
            ->create();

        Payment::factory()
            ->for($users[4])
            ->for($endingSoonSubscription)
            ->for($monthlyPlan)
            ->monthlyPlan()
            ->create();

        $this->command->info('Subscriptions seeded successfully!');
    }
}
