<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BoardList extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'lists';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'board_id',
        'title',
        'position',
        'is_archived',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'is_archived' => 'boolean',
        ];
    }

    /**
     * Get the board that owns the list.
     */
    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    /**
     * Get the tasks for the list.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'list_id')->orderBy('position');
    }

    /**
     * Scope a query to only include archived lists.
     */
    public function scopeArchived(Builder $query): void
    {
        $query->where('is_archived', true);
    }

    /**
     * Scope a query to only include active lists.
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_archived', false);
    }

    /**
     * Scope a query to order by position.
     */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('position');
    }
}
