<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    /** @use HasFactory<\Database\Factories\PaymentFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subscription_id',
        'plan_id',
        'amount',
        'currency',
        'status',
        'type',
        'billing_period_start',
        'billing_period_end',
        'payment_method',
        'payment_method_type',
        'card_last_four',
        'card_brand',
        'stripe_payment_intent_id',
        'stripe_invoice_id',
        'stripe_charge_id',
        'invoice_number',
        'description',
        'metadata',
        'paid_at',
        'failure_code',
        'failure_message',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'status' => PaymentStatus::class,
            'type' => PaymentType::class,
            'billing_period_start' => 'datetime',
            'billing_period_end' => 'datetime',
            'metadata' => 'array',
            'paid_at' => 'datetime',
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
     * @return BelongsTo<Subscription, $this>
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    /**
     * @return BelongsTo<Plan, $this>
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function isCompleted(): bool
    {
        return $this->status === PaymentStatus::Completed;
    }

    public function isPending(): bool
    {
        return $this->status === PaymentStatus::Pending;
    }

    public function isFailed(): bool
    {
        return $this->status === PaymentStatus::Failed;
    }

    public function isCancelled(): bool
    {
        return $this->status === PaymentStatus::Cancelled;
    }

    public function isInitial(): bool
    {
        return $this->type === PaymentType::Initial;
    }

    public function isRenewal(): bool
    {
        return $this->type === PaymentType::Renewal;
    }

    public function isUpgrade(): bool
    {
        return $this->type === PaymentType::Upgrade;
    }

    /**
     * Generate a unique invoice number.
     */
    public static function generateInvoiceNumber(): string
    {
        $prefix = 'INV';
        $year = now()->format('Y');
        $month = now()->format('m');

        // Get the count of payments this month + 1
        $count = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count() + 1;

        return sprintf('%s-%s%s-%04d', $prefix, $year, $month, $count);
    }

    /**
     * Get formatted amount with currency.
     */
    public function getFormattedAmount(): string
    {
        return $this->currency.' '.number_format((float) $this->amount, 2);
    }

    /**
     * Get status label for display.
     */
    public function getStatusLabel(): string
    {
        return $this->status->label();
    }

    /**
     * Get type label for display.
     */
    public function getTypeLabel(): string
    {
        return $this->type->label();
    }

    /**
     * Get card display string (e.g., "Visa ****1234").
     */
    public function getCardDisplay(): ?string
    {
        if ($this->card_brand === null || $this->card_last_four === null) {
            return null;
        }

        return ucfirst($this->card_brand).' ****'.$this->card_last_four;
    }
}
