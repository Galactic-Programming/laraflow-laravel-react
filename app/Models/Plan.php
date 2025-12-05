<?php

namespace App\Models;

use App\Enums\BillingInterval;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    /** @use HasFactory<\Database\Factories\PlanFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'billing_interval',
        'interval_count',
        'features',
        'stripe_price_id',
        'is_active',
        'is_featured',
        'sort_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'billing_interval' => BillingInterval::class,
            'interval_count' => 'integer',
            'features' => 'array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    /**
     * @return HasMany<Subscription, $this>
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function isFree(): bool
    {
        return $this->price <= 0;
    }

    public function isProfessional(): bool
    {
        return str_starts_with($this->slug, 'professional');
    }

    public function isStarter(): bool
    {
        return $this->slug === 'starter';
    }

    /**
     * Check if this is a monthly plan.
     */
    public function isMonthly(): bool
    {
        return $this->billing_interval === BillingInterval::Month;
    }

    /**
     * Check if this is a yearly plan.
     */
    public function isYearly(): bool
    {
        return $this->billing_interval === BillingInterval::Year;
    }

    /**
     * Get the display label for billing interval.
     */
    public function getBillingIntervalLabel(): string
    {
        return $this->billing_interval->label();
    }

    /**
     * Calculate subscription end date from a start date.
     */
    public function calculateEndDate(\Carbon\Carbon $startDate): \Carbon\Carbon
    {
        return $this->billing_interval->calculateEndDate($startDate, $this->interval_count ?? 1);
    }
}
