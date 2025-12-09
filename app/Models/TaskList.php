<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaskList extends Model
{
    /** @use HasFactory<\Database\Factories\TaskListFactory> */
    use HasFactory, LogsActivity;

    /**
     * Get the project ID for activity logging.
     */
    protected function getActivityProjectId(): ?int
    {
        return $this->project_id;
    }

    protected $fillable = [
        'project_id',
        'name',
        'description',
        'color',
        'position',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class)->orderBy('position');
    }

    public function completedTasksCount(): int
    {
        return $this->tasks()->where('status', 'completed')->count();
    }

    public function pendingTasksCount(): int
    {
        return $this->tasks()->whereIn('status', ['pending', 'in_progress'])->count();
    }
}
