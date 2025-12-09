<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'project_id',
        'type',
        'subject_type',
        'subject_id',
        'action',
        'target',
        'target_url',
        'status',
        'tags',
        'comment',
        'assignee',
        'file_name',
        'old_values',
        'new_values',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'array',
            'tags' => 'array',
            'old_values' => 'array',
            'new_values' => 'array',
        ];
    }

    /**
     * Get the user who performed the activity.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the project this activity belongs to.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the subject of the activity (polymorphic).
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get formatted timestamp for display.
     */
    public function getFormattedTimestampAttribute(): string
    {
        return $this->created_at->format('h:i A');
    }

    /**
     * Get formatted date for grouping.
     */
    public function getFormattedDateAttribute(): string
    {
        return strtoupper($this->created_at->format('l, d F'));
    }

    /**
     * Scope to filter by project.
     */
    public function scopeForProject($query, int $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    /**
     * Scope to filter by user mentions.
     */
    public function scopeMentions($query)
    {
        return $query->where('type', 'mention');
    }

    /**
     * Scope to get recent activities.
     */
    public function scopeRecent($query, int $limit = 50)
    {
        return $query->latest()->limit($limit);
    }

    /**
     * Convert to frontend Activity format.
     *
     * @return array<string, mixed>
     */
    public function toActivityFormat(): array
    {
        $user = $this->user;

        return [
            'id' => (string) $this->id,
            'type' => $this->type,
            'subjectType' => $this->getSubjectTypeLabel(),
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'initials' => $this->getInitials($user->name),
                'avatar' => $user->avatar ?? null,
            ] : [
                'id' => 0,
                'name' => 'Unknown',
                'initials' => 'UN',
                'avatar' => null,
            ],
            'action' => $this->action,
            'target' => $this->target,
            'targetUrl' => $this->target_url,
            'status' => $this->status,
            'tags' => $this->tags,
            'comment' => $this->comment,
            'assignee' => $this->assignee,
            'fileName' => $this->file_name,
            'changes' => $this->formatChanges(),
            'timestamp' => $this->formatted_timestamp,
            'date' => $this->formatted_date,
            'createdAt' => $this->created_at->toISOString(),
        ];
    }

    /**
     * Get subject type label for display.
     */
    private function getSubjectTypeLabel(): string
    {
        return match ($this->subject_type) {
            'App\\Models\\Project' => 'project',
            'App\\Models\\TaskList' => 'task_list',
            'App\\Models\\Task' => 'task',
            default => 'unknown',
        };
    }

    /**
     * Format old/new values into detailed changes array.
     *
     * @return array<int, array{field: string, fieldLabel: string, oldValue: mixed, newValue: mixed}>|null
     */
    private function formatChanges(): ?array
    {
        if (empty($this->old_values) && empty($this->new_values)) {
            return null;
        }

        $changes = [];
        $allFields = array_unique(array_merge(
            array_keys($this->old_values ?? []),
            array_keys($this->new_values ?? [])
        ));

        foreach ($allFields as $field) {
            $oldValue = $this->old_values[$field] ?? null;
            $newValue = $this->new_values[$field] ?? null;

            // Skip if values are the same
            if ($oldValue === $newValue) {
                continue;
            }

            $changes[] = [
                'field' => $field,
                'fieldLabel' => $this->getFieldLabel($field),
                'oldValue' => $this->formatFieldValue($field, $oldValue),
                'newValue' => $this->formatFieldValue($field, $newValue),
            ];
        }

        return empty($changes) ? null : $changes;
    }

    /**
     * Get human-readable field label.
     */
    private function getFieldLabel(string $field): string
    {
        $labels = [
            'name' => 'Name',
            'title' => 'Title',
            'description' => 'Description',
            'status' => 'Status',
            'priority' => 'Priority',
            'assigned_to' => 'Assignee',
            'due_date' => 'Due Date',
            'color' => 'Color',
            'icon' => 'Icon',
            'visibility' => 'Visibility',
            'position' => 'Position',
            'completed_at' => 'Completed At',
            'task_list_id' => 'Task List',
            'project_id' => 'Project',
        ];

        return $labels[$field] ?? ucfirst(str_replace('_', ' ', $field));
    }

    /**
     * Format field value for display.
     */
    private function formatFieldValue(string $field, mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        // Handle specific field types
        return match ($field) {
            'status' => $this->formatStatus($value),
            'priority' => $this->formatPriority($value),
            'visibility' => ucfirst($value),
            'assigned_to' => $this->formatAssignee($value),
            'due_date', 'completed_at' => $this->formatDate($value),
            'task_list_id' => $this->formatTaskList($value),
            'color' => $value,
            default => is_string($value) ? $value : json_encode($value),
        };
    }

    /**
     * Format status value.
     */
    private function formatStatus(string $status): string
    {
        $statusLabels = [
            'pending' => 'Pending',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            'active' => 'Active',
            'archived' => 'Archived',
        ];

        return $statusLabels[$status] ?? ucfirst($status);
    }

    /**
     * Format priority value.
     */
    private function formatPriority(string $priority): string
    {
        $priorityLabels = [
            'low' => 'Low',
            'medium' => 'Medium',
            'high' => 'High',
            'urgent' => 'Urgent',
        ];

        return $priorityLabels[$priority] ?? ucfirst($priority);
    }

    /**
     * Format assignee (user ID to name).
     */
    private function formatAssignee(mixed $userId): ?string
    {
        if (! $userId) {
            return 'Unassigned';
        }

        $user = User::find($userId);

        return $user?->name ?? "User #{$userId}";
    }

    /**
     * Format date value.
     */
    private function formatDate(mixed $date): ?string
    {
        if (! $date) {
            return null;
        }

        try {
            return \Carbon\Carbon::parse($date)->format('M d, Y');
        } catch (\Exception $e) {
            return (string) $date;
        }
    }

    /**
     * Format task list ID to name.
     */
    private function formatTaskList(mixed $taskListId): ?string
    {
        if (! $taskListId) {
            return null;
        }

        $taskList = TaskList::find($taskListId);

        return $taskList?->name ?? "List #{$taskListId}";
    }

    /**
     * Get initials from a name.
     */
    private function getInitials(string $name): string
    {
        $words = explode(' ', $name);

        return collect($words)
            ->map(fn ($word) => mb_substr($word, 0, 1))
            ->take(2)
            ->implode('');
    }
}
