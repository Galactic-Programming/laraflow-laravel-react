<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    /** @use HasFactory<\Database\Factories\TaskFactory> */
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * Get the project ID for activity logging.
     */
    protected function getActivityProjectId(): ?int
    {
        return $this->taskList?->project_id;
    }

    /**
     * Get the target URL for activity logging.
     */
    protected function getActivityTargetUrl(): ?string
    {
        $projectId = $this->getActivityProjectId();

        if ($projectId) {
            return "/projects/{$projectId}/tasks/{$this->id}";
        }

        return null;
    }

    protected $fillable = [
        'task_list_id',
        'assigned_to',
        'created_by',
        'title',
        'description',
        'priority',
        'status',
        'position',
        'due_date',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date:Y-m-d',
            'completed_at' => 'datetime',
        ];
    }

    public function taskList(): BelongsTo
    {
        return $this->belongsTo(TaskList::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(Label::class)->withTimestamps();
    }

    public function project(): BelongsTo
    {
        return $this->taskList->project();
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function isOverdue(): bool
    {
        return $this->due_date && $this->due_date->isPast() && $this->status !== 'completed';
    }

    public function hasOtherLabel(): bool
    {
        return $this->labels()->where('name', \App\Enums\TaskLabel::Other)->exists();
    }
}
