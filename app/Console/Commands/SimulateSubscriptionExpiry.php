<?php

namespace App\Console\Commands;

use App\Enums\SubscriptionStatus;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Console\Command;

class SimulateSubscriptionExpiry extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:simulate
                            {scenario : Scenario to simulate (expiring-soon|expired|past-due|active|cancelled)}
                            {--user= : User ID to simulate for}
                            {--days=3 : Days until expiry for expiring-soon scenario}
                            {--reset : Reset subscription to active state}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Simulate subscription scenarios for testing';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $userId = $this->option('user') ?? User::first()?->id;

        if (!$userId) {
            $this->error('No user found. Please specify --user=ID');

            return self::FAILURE;
        }

        $subscription = Subscription::where('user_id', $userId)->first();

        if (!$subscription) {
            $this->error("No subscription found for user {$userId}");

            return self::FAILURE;
        }

        $scenario = $this->argument('scenario');

        if ($this->option('reset')) {
            $this->resetSubscription($subscription);
            $this->info('✅ Subscription reset to active state');
            $this->displaySubscriptionStatus($subscription->fresh());

            return self::SUCCESS;
        }

        match ($scenario) {
            'expiring-soon' => $this->simulateExpiringSoon($subscription),
            'expired' => $this->simulateExpired($subscription),
            'past-due' => $this->simulatePastDue($subscription),
            'active' => $this->simulateActive($subscription),
            'cancelled' => $this->simulateCancelled($subscription),
            default => $this->error("Unknown scenario: {$scenario}"),
        };

        $this->displaySubscriptionStatus($subscription->fresh());

        return self::SUCCESS;
    }

    private function simulateExpiringSoon(Subscription $subscription): void
    {
        $days = (int) $this->option('days');
        $subscription->update([
            'status' => SubscriptionStatus::Active,
            'ends_at' => now()->addDays($days),
            'cancelled_at' => null,
            'grace_period_ends_at' => null, // Clear grace period
        ]);
        $this->info("✅ Subscription set to expire in {$days} days");
    }

    private function simulateExpired(Subscription $subscription): void
    {
        $subscription->update([
            'status' => SubscriptionStatus::Expired,
            'ends_at' => now()->subDay(),
            'grace_period_ends_at' => null, // Clear grace period
            'cancelled_at' => null,
        ]);
        $this->info('✅ Subscription set to expired (no grace period)');
    }

    private function simulatePastDue(Subscription $subscription): void
    {
        $subscription->update([
            'status' => SubscriptionStatus::PastDue,
            'ends_at' => now()->subDays(2),
            'grace_period_ends_at' => now()->addDay(),
        ]);
        $this->info('✅ Subscription set to past due with grace period');
    }

    private function simulateActive(Subscription $subscription): void
    {
        $subscription->update([
            'status' => SubscriptionStatus::Active,
            'ends_at' => now()->addMonth(),
            'cancelled_at' => null,
            'grace_period_ends_at' => null,
        ]);
        $this->info('✅ Subscription set to active (1 month)');
    }

    private function simulateCancelled(Subscription $subscription): void
    {
        $subscription->update([
            'status' => SubscriptionStatus::Cancelled,
            'ends_at' => now()->addDays(15), // Still has 15 days of access
            'cancelled_at' => now(),
            'grace_period_ends_at' => null,
        ]);
        $this->info('✅ Subscription set to cancelled (15 days remaining access)');
    }

    private function resetSubscription(Subscription $subscription): void
    {
        $subscription->update([
            'status' => SubscriptionStatus::Active,
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
            'cancelled_at' => null,
            'grace_period_ends_at' => null,
            'renewal_notified_at' => null,
            'auto_renew' => true,
        ]);
    }

    private function displaySubscriptionStatus(Subscription $subscription): void
    {
        $isExpired = $subscription->status === SubscriptionStatus::Expired
            || ($subscription->ends_at !== null && $subscription->ends_at->isPast());

        $this->newLine();
        $this->table(
            ['Field', 'Value'],
            [
                ['Status', $subscription->status->value],
                ['Starts At', $subscription->starts_at?->format('Y-m-d H:i:s')],
                ['Ends At', $subscription->ends_at?->format('Y-m-d H:i:s')],
                ['Has Access', $subscription->hasAccess() ? '✅ Yes' : '❌ No'],
                ['Is Active', $subscription->isActive() ? '✅ Yes' : '❌ No'],
                ['Is Expired', $isExpired ? '✅ Yes' : '❌ No'],
                ['Is Expiring Soon', $subscription->isExpiringSoon() ? '⚠️ Yes' : 'No'],
                ['Days Until Expiry', $subscription->daysUntilExpiry() ?? 'N/A'],
                ['Auto Renew', $subscription->auto_renew ? '✅ On' : '❌ Off'],
                ['Grace Period Ends', $subscription->grace_period_ends_at?->format('Y-m-d H:i:s') ?? 'N/A'],
            ]
        );
    }
}
