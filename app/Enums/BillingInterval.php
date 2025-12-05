<?php

namespace App\Enums;

enum BillingInterval: string
{
    case Month = 'month';
    case Year = 'year';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Month => 'Monthly',
            self::Year => 'Yearly',
        };
    }

    /**
     * Get short label for display (e.g., "/mo", "/yr").
     */
    public function shortLabel(): string
    {
        return match ($this) {
            self::Month => '/mo',
            self::Year => '/yr',
        };
    }

    /**
     * Get number of days in this interval.
     */
    public function days(): int
    {
        return match ($this) {
            self::Month => 30,
            self::Year => 365,
        };
    }

    /**
     * Calculate end date from start date.
     */
    public function calculateEndDate(\Carbon\Carbon $startDate, int $intervalCount = 1): \Carbon\Carbon
    {
        return match ($this) {
            self::Month => $startDate->copy()->addMonths($intervalCount),
            self::Year => $startDate->copy()->addYears($intervalCount),
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
