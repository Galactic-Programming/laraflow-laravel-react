<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
    case Failed = 'failed';
    case Cancelled = 'cancelled';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Completed => 'Completed',
            self::Failed => 'Failed',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * Get badge color/variant for UI.
     */
    public function badgeVariant(): string
    {
        return match ($this) {
            self::Pending => 'secondary',
            self::Completed => 'default',
            self::Failed => 'destructive',
            self::Cancelled => 'secondary',
        };
    }

    /**
     * Check if payment was successful.
     */
    public function isSuccessful(): bool
    {
        return $this === self::Completed;
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
