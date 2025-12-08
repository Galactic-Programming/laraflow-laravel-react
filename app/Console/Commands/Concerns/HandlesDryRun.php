<?php

namespace App\Console\Commands\Concerns;

trait HandlesDryRun
{
    /**
     * Check if the command is running in dry-run mode.
     */
    protected function isDryRun(): bool
    {
        return (bool) $this->option('dry-run');
    }

    /**
     * Output information based on dry-run mode.
     *
     * @param string $message Message to display
     * @param bool $isDryRun Whether this is a dry-run action
     */
    protected function dryRunInfo(string $message, ?bool $isDryRun = null): void
    {
        $isDryRun = $isDryRun ?? $this->isDryRun();
        
        if ($isDryRun) {
            $this->info("Would {$message}");
        } else {
            $this->info($message);
        }
    }

    /**
     * Output a summary based on dry-run mode.
     *
     * @param int $count Number of items affected
     * @param string $action Action being performed (e.g., "expire", "send")
     * @param string $subject Subject of the action (e.g., "subscriptions", "notifications")
     */
    protected function dryRunSummary(int $count, string $action, string $subject): void
    {
        if ($this->isDryRun()) {
            $this->info("Would {$action} {$count} {$subject}.");
        } else {
            $this->info(ucfirst($action) . " {$count} {$subject}.");
        }
    }
}
