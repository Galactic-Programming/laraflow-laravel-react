<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'plan_id',
        'status',
        'stripe_subscription_id',
        'stripe_customer_id',
        'starts_at',
        'ends_at',
        'cancelled_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'cancelled_at' => 'datetime',
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
        if ($this->status === 'active') {
            return $this->ends_at === null || $this->ends_at->isFuture();
        }

        // Cancelled subscription still has access until ends_at
        if ($this->status === 'cancelled') {
            return $this->ends_at !== null && $this->ends_at->isFuture();
        }

        // Expired, past_due, or other statuses = no access
        return false;
    }

    /**
     * Check if subscription is technically active (not cancelled).
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && ($this->ends_at === null || $this->ends_at->isFuture());
    }

    /**
     * Check if subscription is cancelled but still has access.
     */
    public function isCancelledButActive(): bool
    {
        return $this->status === 'cancelled'
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
}
