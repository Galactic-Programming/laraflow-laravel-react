<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    /** @use HasFactory<\Database\Factories\SubscriptionFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_id',
        'status',
        'stripe_subscription_id',
        'stripe_customer_id',
        'starts_at',
        'ends_at',
        'cancelled_at',
        'cancellation_reason',
        'auto_renew',
        'renewal_notified_at',
        'renewal_notification_count',
        'grace_period_ends_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => SubscriptionStatus::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'auto_renew' => 'boolean',
            'renewal_notified_at' => 'datetime',
            'renewal_notification_count' => 'integer',
            'grace_period_ends_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Plan, $this>
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Check if subscription grants access to premium features.
     * User still has access if subscription is active OR cancelled but not yet expired.
     */
    public function hasAccess(): bool
    {
        // Active subscription always has access
        if ($this->status === SubscriptionStatus::Active) {
            return $this->ends_at === null || $this->ends_at->isFuture();
        }

        // Cancelled subscription still has access until ends_at
        if ($this->status === SubscriptionStatus::Cancelled) {
            return $this->ends_at !== null && $this->ends_at->isFuture();
        }

        // Check grace period for expired/past_due subscriptions
        if ($this->grace_period_ends_at !== null && $this->grace_period_ends_at->isFuture()) {
            return true;
        }

        // Expired, past_due = no access
        return false;
    }

    /**
     * Check if subscription is technically active (not cancelled).
     */
    public function isActive(): bool
    {
        return $this->status === SubscriptionStatus::Active
            && ($this->ends_at === null || $this->ends_at->isFuture());
    }

    /**
     * Check if subscription is cancelled but still has access.
     */
    public function isCancelledButActive(): bool
    {
        return $this->status === SubscriptionStatus::Cancelled
            && $this->ends_at !== null
            && $this->ends_at->isFuture();
    }

    /**
     * Check if user has Professional plan access (includes cancelled but not expired).
     */
    public function isProfessional(): bool
    {
        return $this->hasAccess() && $this->plan?->isProfessional();
    }

    public function isStarter(): bool
    {
        return $this->hasAccess() && $this->plan?->isStarter();
    }

    /**
     * Check if subscription is expiring soon (within X days).
     */
    public function isExpiringSoon(int $days = 7): bool
    {
        if ($this->ends_at === null) {
            return false;
        }

        return $this->ends_at->isFuture()
            && $this->ends_at->diffInDays(now()) <= $days;
    }

    /**
     * Check if user can purchase a new subscription.
     * Returns false if user already has an active subscription that hasn't expired.
     */
    public function canPurchaseNew(): bool
    {
        // Cannot purchase if subscription is active and not expired
        if ($this->status === SubscriptionStatus::Active && $this->ends_at !== null && $this->ends_at->isFuture()) {
            return false;
        }

        // Cannot purchase if cancelled but still has access
        if ($this->status === SubscriptionStatus::Cancelled && $this->ends_at !== null && $this->ends_at->isFuture()) {
            return false;
        }

        return true;
    }

    /**
     * Get number of days until subscription expires.
     */
    public function daysUntilExpiry(): ?int
    {
        if ($this->ends_at === null) {
            return null;
        }

        if ($this->ends_at->isPast()) {
            return 0;
        }

        return (int) now()->diffInDays($this->ends_at, false);
    }

    /**
     * Get remaining time breakdown (days, hours, minutes, seconds).
     *
     * @return array{days: int, hours: int, minutes: int, seconds: int, total_seconds: int, is_expired: bool}
     */
    public function getRemainingTime(): array
    {
        if ($this->ends_at === null) {
            return [
                'days' => 0,
                'hours' => 0,
                'minutes' => 0,
                'seconds' => 0,
                'total_seconds' => 0,
                'is_expired' => false,
            ];
        }

        if ($this->ends_at->isPast()) {
            return [
                'days' => 0,
                'hours' => 0,
                'minutes' => 0,
                'seconds' => 0,
                'total_seconds' => 0,
                'is_expired' => true,
            ];
        }

        $totalSeconds = now()->diffInSeconds($this->ends_at);
        $days = (int) floor($totalSeconds / 86400);
        $hours = (int) floor(($totalSeconds % 86400) / 3600);
        $minutes = (int) floor(($totalSeconds % 3600) / 60);
        $seconds = (int) ($totalSeconds % 60);

        return [
            'days' => $days,
            'hours' => $hours,
            'minutes' => $minutes,
            'seconds' => $seconds,
            'total_seconds' => (int) $totalSeconds,
            'is_expired' => false,
        ];
    }

    /**
     * Get total duration of subscription in days.
     */
    public function getTotalDurationDays(): ?int
    {
        if ($this->starts_at === null || $this->ends_at === null) {
            return null;
        }

        return (int) $this->starts_at->diffInDays($this->ends_at);
    }

    /**
     * Get progress percentage (how much time has passed).
     */
    public function getProgressPercentage(): float
    {
        if ($this->starts_at === null || $this->ends_at === null) {
            return 0;
        }

        $totalDuration = $this->starts_at->diffInSeconds($this->ends_at);
        $elapsed = $this->starts_at->diffInSeconds(now());

        if ($totalDuration <= 0) {
            return 100;
        }

        $percentage = ($elapsed / $totalDuration) * 100;

        return min(100, max(0, round($percentage, 2)));
    }

    /**
     * Get remaining percentage (how much time is left).
     */
    public function getRemainingPercentage(): float
    {
        return 100 - $this->getProgressPercentage();
    }

    /**
     * Toggle auto-renewal setting.
     */
    public function toggleAutoRenew(): bool
    {
        $this->auto_renew = ! $this->auto_renew;
        $this->save();

        return $this->auto_renew;
    }

    /**
     * Check if subscription should auto-renew.
     */
    public function shouldAutoRenew(): bool
    {
        return $this->auto_renew
            && $this->status === SubscriptionStatus::Active
            && $this->ends_at !== null;
    }

    /**
     * Check if renewal notification should be sent.
     * Send notifications at 7 days, 3 days, and 1 day before expiry.
     */
    public function shouldSendRenewalNotification(): bool
    {
        if ($this->ends_at === null || ! $this->hasAccess()) {
            return false;
        }

        $daysUntilExpiry = $this->daysUntilExpiry();

        if ($daysUntilExpiry === null) {
            return false;
        }

        // Notification thresholds
        $notificationDays = [7, 3, 1];

        if (! in_array($daysUntilExpiry, $notificationDays, true)) {
            return false;
        }

        // Check if we already sent notification today
        if ($this->renewal_notified_at !== null && $this->renewal_notified_at->isToday()) {
            return false;
        }

        return true;
    }

    /**
     * Mark renewal notification as sent.
     */
    public function markRenewalNotificationSent(): void
    {
        $this->update([
            'renewal_notified_at' => now(),
            'renewal_notification_count' => $this->renewal_notification_count + 1,
        ]);
    }

    /**
     * Set grace period after expiry (default 3 days).
     */
    public function setGracePeriod(int $days = 3): void
    {
        if ($this->ends_at !== null) {
            $this->update([
                'grace_period_ends_at' => $this->ends_at->copy()->addDays($days),
            ]);
        }
    }

    /**
     * Get status label for display.
     */
    public function getStatusLabel(): string
    {
        return $this->status->label();
    }

    /**
     * Get status badge variant for UI.
     */
    public function getStatusBadgeVariant(): string
    {
        return $this->status->badgeVariant();
    }
}
