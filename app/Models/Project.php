<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * Get the project ID for activity logging.
     */
    protected function getActivityProjectId(): ?int
    {
        return $this->id;
    }

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'color',
        'icon',
        'status',
        'visibility',
        'due_date',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function taskLists(): HasMany
    {
        return $this->hasMany(TaskList::class)->orderBy('position');
    }

    public function tasks(): HasManyThrough
    {
        return $this->hasManyThrough(Task::class, TaskList::class);
    }

    public function completedTasksCount(): int
    {
        return $this->tasks()->where('status', 'completed')->count();
    }

    public function totalTasksCount(): int
    {
        return $this->tasks()->count();
    }

    public function progressPercentage(): float
    {
        $total = $this->totalTasksCount();

        if ($total === 0) {
            return 0;
        }

        return round(($this->completedTasksCount() / $total) * 100, 1);
    }
}
