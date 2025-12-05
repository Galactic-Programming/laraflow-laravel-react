<?php

namespace App\Notifications;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubscriptionRenewalNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Subscription $subscription,
        public int $daysUntilExpiry
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $planName = $this->subscription->plan->name;
        $expiryDate = $this->subscription->ends_at->format('F j, Y');

        $message = (new MailMessage)
            ->subject($this->getSubject($planName))
            ->greeting("Hello {$notifiable->name}!")
            ->line("Your {$planName} subscription will expire on {$expiryDate} ({$this->daysUntilExpiry} days from now).");

        if ($this->subscription->auto_renew) {
            $message->line('✅ Your subscription will automatically renew. No action needed.')
                ->line('Your payment method on file will be charged automatically.');
        } else {
            $message->line('⚠️ Auto-renewal is disabled for your subscription.')
                ->line('Please renew manually before the expiry date to continue enjoying your benefits.')
                ->action('Manage Subscription', url('/settings/billing'));
        }

        return $message
            ->line('Thank you for being a valued customer!')
            ->salutation('Best regards, The '.config('app.name').' Team');
    }

    /**
     * Get the subject line based on days until expiry.
     */
    private function getSubject(string $planName): string
    {
        return match (true) {
            $this->daysUntilExpiry <= 1 => "⚠️ Your {$planName} subscription expires tomorrow!",
            $this->daysUntilExpiry <= 3 => "⏰ Your {$planName} subscription expires in {$this->daysUntilExpiry} days",
            default => "📅 Your {$planName} subscription expires in {$this->daysUntilExpiry} days",
        };
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'subscription_id' => $this->subscription->id,
            'plan_name' => $this->subscription->plan->name,
            'days_until_expiry' => $this->daysUntilExpiry,
            'expires_at' => $this->subscription->ends_at->toIso8601String(),
            'auto_renew' => $this->subscription->auto_renew,
        ];
    }
}
