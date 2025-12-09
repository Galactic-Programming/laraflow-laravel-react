<?php

namespace App\Enums;

enum TaskLabel: string
{
    case Bug = 'bug';
    case Feature = 'feature';
    case Enhancement = 'enhancement';
    case Documentation = 'documentation';
    case Testing = 'testing';
    case Refactor = 'refactor';
    case Urgent = 'urgent';
    case Blocked = 'blocked';
    case NeedsReview = 'needs_review';
    case InReview = 'in_review';
    case Approved = 'approved';
    case Other = 'other';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Bug => 'Bug',
            self::Feature => 'Feature',
            self::Enhancement => 'Enhancement',
            self::Documentation => 'Documentation',
            self::Testing => 'Testing',
            self::Refactor => 'Refactor',
            self::Urgent => 'Urgent',
            self::Blocked => 'Blocked',
            self::NeedsReview => 'Needs Review',
            self::InReview => 'In Review',
            self::Approved => 'Approved',
            self::Other => 'Other',
        };
    }

    /**
     * Get color for this label.
     */
    public function color(): string
    {
        return match ($this) {
            self::Bug => '#ef4444',
            self::Feature => '#3b82f6',
            self::Enhancement => '#10b981',
            self::Documentation => '#f59e0b',
            self::Testing => '#a855f7',
            self::Refactor => '#fb923c',
            self::Urgent => '#dc2626',
            self::Blocked => '#1f2937',
            self::NeedsReview => '#06b6d4',
            self::InReview => '#6366f1',
            self::Approved => '#22c55e',
            self::Other => '#6b7280',
        };
    }

    /**
     * Get description for this label.
     */
    public function description(): string
    {
        return match ($this) {
            self::Bug => 'Something is not working correctly',
            self::Feature => 'New feature request',
            self::Enhancement => 'Improvement to existing feature',
            self::Documentation => 'Documentation related task',
            self::Testing => 'Testing and QA',
            self::Refactor => 'Code refactoring',
            self::Urgent => 'Requires immediate attention',
            self::Blocked => 'Task is blocked by dependencies',
            self::NeedsReview => 'Waiting for code review',
            self::InReview => 'Currently being reviewed',
            self::Approved => 'Changes have been approved',
            self::Other => 'General task that doesn\'t fit other categories',
        };
    }

    /**
     * Get category for grouping labels.
     */
    public function category(): string
    {
        return match ($this) {
            self::Bug, self::Feature, self::Enhancement,
            self::Documentation, self::Testing, self::Refactor, self::Other => 'Type',
            self::Urgent, self::Blocked => 'Priority',
            self::NeedsReview, self::InReview, self::Approved => 'Workflow',
        };
    }

    /**
     * Get sort order for display.
     */
    public function sortOrder(): int
    {
        return match ($this) {
            self::Bug => 1,
            self::Feature => 2,
            self::Enhancement => 3,
            self::Documentation => 4,
            self::Testing => 5,
            self::Refactor => 6,
            self::Urgent => 7,
            self::Blocked => 8,
            self::NeedsReview => 9,
            self::InReview => 10,
            self::Approved => 11,
            self::Other => 99,
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

    /**
     * Get labels grouped by category.
     *
     * @return array<string, array<self>>
     */
    public static function groupedByCategory(): array
    {
        $grouped = [];
        foreach (self::cases() as $label) {
            $category = $label->category();
            if (! isset($grouped[$category])) {
                $grouped[$category] = [];
            }
            $grouped[$category][] = $label;
        }

        return $grouped;
    }

    /**
     * Check if this is the "Other" fallback label.
     */
    public function isOther(): bool
    {
        return $this === self::Other;
    }
}
