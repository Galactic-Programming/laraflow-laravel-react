<?php

namespace App\Enums;

enum SubscriptionStatus: string
{
    case Active = 'active';
    case Cancelled = 'cancelled';
    case Expired = 'expired';
    case PastDue = 'past_due';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Cancelled => 'Cancelled',
            self::Expired => 'Expired',
            self::PastDue => 'Past Due',
        };
    }

    /**
     * Get badge color/variant for UI.
     */
    public function badgeVariant(): string
    {
        return match ($this) {
            self::Active => 'default',
            self::Cancelled => 'secondary',
            self::Expired => 'destructive',
            self::PastDue => 'destructive',
        };
    }

    /**
     * Check if this status grants access to premium features.
     * Note: Cancelled still grants access until ends_at date.
     */
    public function grantsAccess(): bool
    {
        return match ($this) {
            self::Active, self::Cancelled => true,
            self::Expired, self::PastDue => false,
        };
    }

    /**
     * Get all values as array for validation.
     *
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
