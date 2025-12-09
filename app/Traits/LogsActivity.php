<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * Trait to automatically log model activities.
 *
 * Usage:
 * 1. Add `use LogsActivity;` to your model
 * 2. Optionally override `getActivityLogType()`, `getActivityLogAction()`, etc.
 */
trait LogsActivity
{
    /**
     * Boot the trait.
     */
    public static function bootLogsActivity(): void
    {
        static::created(function (Model $model) {
            $modelName = $model->getActivityModelName();
            $model->logActivity('created', "created {$modelName}");
        });

        static::updated(function (Model $model) {
            $model->logModelUpdate();
        });

        static::deleted(function (Model $model) {
            $modelName = $model->getActivityModelName();
            $model->logActivity('deleted', "deleted {$modelName}");
        });
    }

    /**
     * Log a model update with change detection.
     */
    protected function logModelUpdate(): void
    {
        $changes = $this->getChanges();
        $original = $this->getOriginal();

        // Skip if no meaningful changes
        $ignoredFields = $this->getIgnoredFields();
        $meaningfulChanges = array_diff_key($changes, array_flip($ignoredFields));

        if (empty($meaningfulChanges)) {
            return;
        }

        // Determine specific update type
        $type = $this->determineUpdateType($meaningfulChanges);
        $action = $this->buildUpdateAction($meaningfulChanges);

        $oldValues = [];
        $newValues = [];

        foreach ($meaningfulChanges as $field => $newValue) {
            if (isset($original[$field])) {
                $oldValues[$field] = $original[$field];
            }
            $newValues[$field] = $newValue;
        }

        $extra = [
            'old_values' => $oldValues,
            'new_values' => $newValues,
        ];

        // Add status config for status changes
        if ($type === 'status_change' && isset($meaningfulChanges['status'])) {
            $extra['status'] = $this->getStatusConfig($meaningfulChanges['status']);
        }

        // Add assignee for assignments
        if ($type === 'assignment' && isset($meaningfulChanges['assigned_to'])) {
            $assignee = $this->getAssigneeName($meaningfulChanges['assigned_to']);
            if ($assignee) {
                $extra['assignee'] = $assignee;
            }
        }

        $this->logActivity($type, $action, $extra);
    }

    /**
     * Log an activity for this model.
     *
     * @param  array<string, mixed>  $extra
     */
    public function logActivity(string $type, string $action, array $extra = []): ?ActivityLog
    {
        $userId = Auth::id();

        if (! $userId) {
            return null;
        }

        $data = array_merge([
            'user_id' => $userId,
            'project_id' => $this->getActivityProjectId(),
            'type' => $type,
            'subject_type' => get_class($this),
            'subject_id' => $this->getKey(),
            'action' => $action,
            'target' => $this->getActivityTarget(),
            'target_url' => $this->getActivityTargetUrl(),
        ], $extra);

        return ActivityLog::create($data);
    }

    /**
     * Log a status change activity.
     */
    public function logStatusChange(string $newStatus, string $oldStatus): ?ActivityLog
    {
        $statusConfig = $this->getStatusConfig($newStatus);

        return $this->logActivity('status_change', 'changed status', [
            'status' => $statusConfig,
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => $newStatus],
        ]);
    }

    /**
     * Log an assignment activity.
     */
    public function logAssignment(string $assigneeName): ?ActivityLog
    {
        return $this->logActivity('assignment', 'assigned', [
            'assignee' => $assigneeName,
        ]);
    }

    /**
     * Log a comment activity.
     */
    public function logComment(string $comment): ?ActivityLog
    {
        return $this->logActivity('comment', 'commented on', [
            'comment' => $comment,
        ]);
    }

    /**
     * Log a mention activity.
     */
    public function logMention(string $comment, int $mentionedUserId): ?ActivityLog
    {
        return $this->logActivity('mention', 'mentioned you in', [
            'comment' => $comment,
        ]);
    }

    /**
     * Log tags added activity.
     *
     * @param  array<int, array{text: string, color: string}>  $tags
     */
    public function logTagsAdded(array $tags): ?ActivityLog
    {
        return $this->logActivity('tag_added', 'added tags', [
            'tags' => $tags,
        ]);
    }

    /**
     * Log file added activity.
     */
    public function logFileAdded(string $fileName): ?ActivityLog
    {
        return $this->logActivity('file_added', 'added file', [
            'file_name' => $fileName,
        ]);
    }

    /**
     * Determine update type based on changed fields.
     */
    protected function determineUpdateType(array $changes): string
    {
        if (isset($changes['status'])) {
            return 'status_change';
        }

        if (isset($changes['assigned_to'])) {
            return 'assignment';
        }

        return 'updated';
    }

    /**
     * Build action description based on changes.
     */
    protected function buildUpdateAction(array $changes): string
    {
        $modelName = $this->getActivityModelName();

        if (isset($changes['status'])) {
            $newStatus = $this->formatStatusLabel($changes['status']);

            return "changed {$modelName} status to {$newStatus}";
        }

        if (isset($changes['assigned_to'])) {
            return "reassigned {$modelName}";
        }

        if (isset($changes['priority'])) {
            $newPriority = ucfirst($changes['priority']);

            return "changed {$modelName} priority to {$newPriority}";
        }

        if (isset($changes['due_date'])) {
            return "updated {$modelName} due date";
        }

        if (isset($changes['title']) || isset($changes['name'])) {
            return "renamed {$modelName}";
        }

        if (isset($changes['description'])) {
            return "updated {$modelName} description";
        }

        $fieldCount = count($changes);
        if ($fieldCount === 1) {
            $field = array_key_first($changes);

            return "updated {$modelName} ".str_replace('_', ' ', $field);
        }

        return "updated {$modelName} ({$fieldCount} fields)";
    }

    /**
     * Get the model name for activity messages.
     */
    protected function getActivityModelName(): string
    {
        return strtolower(class_basename($this));
    }

    /**
     * Format status label for display.
     */
    protected function formatStatusLabel(string $status): string
    {
        $labels = [
            'pending' => 'Pending',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            'active' => 'Active',
            'archived' => 'Archived',
        ];

        return $labels[$status] ?? ucfirst($status);
    }

    /**
     * Get the project ID for this activity.
     * Override in model if needed.
     */
    protected function getActivityProjectId(): ?int
    {
        // Default implementations for common models
        if (property_exists($this, 'project_id')) {
            return $this->project_id;
        }

        if (method_exists($this, 'project')) {
            return $this->project?->id;
        }

        if (method_exists($this, 'taskList')) {
            return $this->taskList?->project_id;
        }

        return null;
    }

    /**
     * Get the target identifier for this activity.
     * Override in model if needed.
     */
    protected function getActivityTarget(): string
    {
        if (isset($this->title)) {
            return $this->title;
        }

        if (isset($this->name)) {
            return $this->name;
        }

        return class_basename($this).'-'.$this->getKey();
    }

    /**
     * Get the target URL for this activity.
     * Override in model if needed.
     */
    protected function getActivityTargetUrl(): ?string
    {
        return null;
    }

    /**
     * Get status display configuration.
     *
     * @return array{text: string, color: string}
     */
    protected function getStatusConfig(string $status): array
    {
        $statusMap = [
            'pending' => ['text' => 'Pending', 'color' => 'purple'],
            'in_progress' => ['text' => 'In Progress', 'color' => 'blue'],
            'completed' => ['text' => 'Completed', 'color' => 'green'],
            'cancelled' => ['text' => 'Cancelled', 'color' => 'default'],
            'active' => ['text' => 'Active', 'color' => 'green'],
            'archived' => ['text' => 'Archived', 'color' => 'default'],
        ];

        return $statusMap[$status] ?? ['text' => ucfirst($status), 'color' => 'default'];
    }

    /**
     * Get assignee name from user ID.
     * Override in model if needed.
     */
    protected function getAssigneeName(?int $userId): ?string
    {
        if (! $userId) {
            return null;
        }

        $user = \App\Models\User::find($userId);

        return $user?->name;
    }

    /**
     * Get fields to ignore when logging updates.
     *
     * @return array<int, string>
     */
    protected function getIgnoredFields(): array
    {
        return ['updated_at', 'created_at', 'deleted_at', 'remember_token'];
    }
}
