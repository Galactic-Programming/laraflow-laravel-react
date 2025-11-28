<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subtask extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'task_id',
        'title',
        'is_completed',
        'position',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_completed' => 'boolean',
            'position' => 'integer',
        ];
    }

    /**
     * Get the task that owns the subtask.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Scope a query to only include completed subtasks.
     */
    public function scopeCompleted(Builder $query): void
    {
        $query->where('is_completed', true);
    }

    /**
     * Scope a query to only include pending subtasks.
     */
    public function scopePending(Builder $query): void
    {
        $query->where('is_completed', false);
    }

    /**
     * Scope a query to order by position.
     */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('position');
    }
}
