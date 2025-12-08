<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait ManagesPositions
{
    /**
     * Reorder items when position changes.
     *
     * @param Builder $query Base query for items in the same container
     * @param int $oldPosition Current position of the item
     * @param int $newPosition Desired new position
     * @param int|null $excludeId ID of the item being moved (to exclude from shifts)
     */
    protected function reorderPositions(
        Builder $query,
        int $oldPosition,
        int $newPosition,
        ?int $excludeId = null
    ): void {
        if ($oldPosition === $newPosition) {
            return;
        }

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        if ($newPosition < $oldPosition) {
            // Moving up (to lower position number): shift items down (increment)
            $query->clone()
                ->where('position', '>=', $newPosition)
                ->where('position', '<', $oldPosition)
                ->increment('position');
        } else {
            // Moving down (to higher position number): shift items up (decrement)
            $query->clone()
                ->where('position', '>', $oldPosition)
                ->where('position', '<=', $newPosition)
                ->decrement('position');
        }
    }

    /**
     * Make room for a new item at the specified position.
     *
     * @param Builder $query Base query for items in the same container
     * @param int $position Position where the new item will be inserted
     */
    protected function makeRoomAtPosition(Builder $query, int $position): void
    {
        $query->clone()
            ->where('position', '>=', $position)
            ->increment('position');
    }

    /**
     * Close the gap left by a deleted item.
     *
     * @param Builder $query Base query for items in the same container
     * @param int $position Position of the deleted item
     */
    protected function closeGapAtPosition(Builder $query, int $position): void
    {
        $query->clone()
            ->where('position', '>', $position)
            ->decrement('position');
    }

    /**
     * Get the next available position in a container.
     *
     * @param Builder $query Base query for items in the same container
     * @return int
     */
    protected function getNextPosition(Builder $query): int
    {
        return ($query->max('position') ?? -1) + 1;
    }
}
