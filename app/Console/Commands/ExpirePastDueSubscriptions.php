<?php

namespace App\Console\Commands;

use App\Enums\SubscriptionStatus;
use App\Models\Subscription;
use Illuminate\Console\Command;

class ExpirePastDueSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:expire-past-due
                            {--dry-run : Show what would be expired without actually expiring}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire subscriptions that are past due and grace period has ended';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');

        // Find past due subscriptions where grace period has ended
        $query = Subscription::query()
            ->where('status', SubscriptionStatus::PastDue)
            ->where(function ($query) {
                $query->whereNull('grace_period_ends_at')
                    ->orWhere('grace_period_ends_at', '<', now());
            });

        if ($isDryRun) {
            $subscriptions = $query->with('user')->get();
            $count = $subscriptions->count();

            foreach ($subscriptions as $subscription) {
                $this->info("Would expire subscription #{$subscription->id} for {$subscription->user->email}");
            }

            $this->newLine();
            $this->info("Would expire {$count} past-due subscriptions.");

            return Command::SUCCESS;
        }

        $expired = $query->update(['status' => SubscriptionStatus::Expired]);

        $this->info("Expired {$expired} past-due subscriptions.");

        return Command::SUCCESS;
    }
}
