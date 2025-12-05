<?php

namespace App\Console\Commands;

use App\Enums\SubscriptionStatus;
use App\Models\Subscription;
use App\Notifications\SubscriptionRenewalNotification;
use Illuminate\Console\Command;

class SendRenewalNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:send-renewal-notifications
                            {--dry-run : Show what would be sent without actually sending}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send renewal notifications to users with expiring subscriptions';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');

        $subscriptions = Subscription::query()
            ->with(['user', 'plan'])
            ->where('status', SubscriptionStatus::Active)
            ->whereNotNull('ends_at')
            ->get();

        $sent = 0;
        $skipped = 0;

        foreach ($subscriptions as $subscription) {
            if (! $subscription->shouldSendRenewalNotification()) {
                $skipped++;

                continue;
            }

            $daysUntilExpiry = (int) now()->diffInDays($subscription->ends_at, false);

            if ($daysUntilExpiry < 0) {
                $skipped++;

                continue;
            }

            if ($isDryRun) {
                $this->info("Would send notification to {$subscription->user->email} ({$daysUntilExpiry} days until expiry)");
                $sent++;

                continue;
            }

            try {
                $subscription->user->notify(
                    new SubscriptionRenewalNotification($subscription, $daysUntilExpiry)
                );

                $subscription->markRenewalNotificationSent();
                $sent++;

                $this->line("Sent notification to {$subscription->user->email}");
            } catch (\Exception $e) {
                $this->error("Failed to send notification to {$subscription->user->email}: {$e->getMessage()}");
            }
        }

        $this->newLine();
        $this->info($isDryRun ? "Would send {$sent} renewal notifications." : "Sent {$sent} renewal notifications.");
        $this->info("Skipped {$skipped} subscriptions (not eligible for notification).");

        return Command::SUCCESS;
    }
}
