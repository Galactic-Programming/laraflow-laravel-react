<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class Board extends Model
{
    use SoftDeletes;
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'color',
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
            'is_archived' => 'boolean',
        ];
    }

    /**
     * Get the user that owns the board.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the lists for the board.
     */
    public function lists(): HasMany
    {
        return $this->hasMany(BoardList::class);
    }

    /**
     * Get the tasks for the board via its lists.
     */
    public function tasks(): HasManyThrough
    {
        return $this->hasManyThrough(
            Task::class,      // Final model
            BoardList::class, // Intermediate model
            'board_id',       // Foreign key on BoardList referencing boards.id
            'list_id',        // Foreign key on Task referencing lists.id
            'id',             // Local key on boards
            'id'              // Local key on lists
        );
    }

    /**
     * Get the labels for the board.
     */
    public function labels(): HasMany
    {
        return $this->hasMany(Label::class);
    }

    /**
     * Get the users that are members of the board.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'board_members')
            ->using(BoardMember::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Scope a query to only include archived boards.
     */
    public function scopeArchived(Builder $query): void
    {
        $query->where('is_archived', true);
    }

    /**
     * Scope a query to only include active boards.
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_archived', false);
    }
}
