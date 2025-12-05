<?php

namespace App\Enums;

enum PaymentType: string
{
    case Initial = 'initial';
    case Renewal = 'renewal';
    case Upgrade = 'upgrade';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Initial => 'Initial Payment',
            self::Renewal => 'Renewal',
            self::Upgrade => 'Upgrade',
        };
    }

    /**
     * Get short label for display.
     */
    public function shortLabel(): string
    {
        return match ($this) {
            self::Initial => 'New',
            self::Renewal => 'Renewal',
            self::Upgrade => 'Upgrade',
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
