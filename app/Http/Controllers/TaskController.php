<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Hiển thị tất cả tasks
     */
    public function index(Request $request)
    {
        $query = Task::with(['assignee', 'creator', 'taskList.project', 'labels']);

        // Sorting
        $sortField = $request->input('sort', 'created_at');
        $sortOrder = $request->input('order', 'desc');

        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['id', 'title', 'status', 'priority', 'due_date', 'created_at', 'updated_at'];
        if (! in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }

        // Validate sort order
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? $sortOrder : 'desc';

        // Custom sorting for status and priority
        if ($sortField === 'status') {
            $statusOrder = $sortOrder === 'asc'
                ? "FIELD(status, 'pending', 'in_progress', 'completed', 'cancelled')"
                : "FIELD(status, 'cancelled', 'completed', 'in_progress', 'pending')";
            $query->orderByRaw($statusOrder);
        } elseif ($sortField === 'priority') {
            $priorityOrder = $sortOrder === 'asc'
                ? "FIELD(priority, 'high', 'medium', 'low')"
                : "FIELD(priority, 'low', 'medium', 'high')";
            $query->orderByRaw($priorityOrder);
        } else {
            $query->orderBy($sortField, $sortOrder);
        }

        // Search filter - exact match for task code or starts with for title
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                // Exact match for task code (e.g., TASK-01)
                $q->where('id', $search)
                    // Or starts with for title
                    ->orWhere('title', 'like', "{$search}%");
            });
        }

        // Status filter - only apply if not empty
        if ($request->filled('status') && $request->status !== '' && $request->status !== []) {
            $statuses = is_array($request->status)
                ? array_filter($request->status) // Remove empty values
                : [$request->status];

            if (! empty($statuses)) {
                $query->whereIn('status', $statuses);
            }
        }

        // Priority filter - only apply if not empty
        if ($request->filled('priority') && $request->priority !== '' && $request->priority !== []) {
            $priorities = is_array($request->priority)
                ? array_filter($request->priority) // Remove empty values
                : [$request->priority];

            if (! empty($priorities)) {
                $query->whereIn('priority', $priorities);
            }
        }

        // Pagination with per_page support
        $perPage = $request->input('per_page', 10);
        $tasks = $query->paginate($perPage);

        // Map labels to include enum value
        $tasks->getCollection()->transform(function ($task) {
            if ($task->labels) {
                $task->labels = $task->labels->map(function ($label) {
                    return [
                        'id' => $label->id,
                        'name' => $label->name->value ?? $label->name,
                        'color' => $label->color,
                        'description' => $label->description,
                        'category' => $label->category,
                    ];
                });
            }

            return $task;
        });

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'priority' => $request->priority,
                'per_page' => $perPage,
                'sort' => $sortField,
                'order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Đảm bảo:
     * - TaskList thuộc Project
     * - Task thuộc TaskList (nếu có)
     */
    private function ensureBelongs(Project $project, TaskList $taskList, ?Task $task = null): void
    {
        if ($taskList->project_id !== $project->id) {
            abort(404);
        }

        if ($task && $task->task_list_id !== $taskList->id) {
            abort(404);
        }
    }

    /**
     * Tạo task mới trong list
     */
    public function store(Request $request, Project $project, TaskList $taskList)
    {
        $this->ensureBelongs($project, $taskList);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'due_date' => 'nullable|date',
        ]);

        $position = ($taskList->tasks()->max('position') ?? -1) + 1;

        $task = $taskList->tasks()->create([
            ...$validated,
            'position' => $position,
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Task created successfully');
    }

    /**
     * Cập nhật task
     */
    public function update(Request $request, Project $project, TaskList $taskList, Task $task)
    {
        $this->ensureBelongs($project, $taskList, $task);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|required|in:low,medium,high',
            'status' => 'sometimes|required|in:pending,in_progress,completed,cancelled',
            'due_date' => 'nullable|date',
            'position' => 'sometimes|integer|min:0',
            'task_list_id' => 'sometimes|integer|exists:task_lists,id',
        ]);

        // Handle position/list change
        if (isset($validated['position']) || isset($validated['task_list_id'])) {
            $newListId = $validated['task_list_id'] ?? $task->task_list_id;
            $newPosition = $validated['position'] ?? $task->position;

            // If moving to a different list
            if ($newListId != $task->task_list_id) {
                // Verify new list belongs to project
                $newList = TaskList::where('id', $newListId)
                    ->where('project_id', $project->id)
                    ->firstOrFail();

                // Shift tasks in old list (close the gap)
                Task::where('task_list_id', $task->task_list_id)
                    ->where('position', '>', $task->position)
                    ->decrement('position');

                // Shift tasks in new list (make room)
                Task::where('task_list_id', $newListId)
                    ->where('position', '>=', $newPosition)
                    ->increment('position');

                $task->task_list_id = $newListId;
                $task->position = $newPosition;
            } else {
                // Moving within the same list
                $oldPosition = $task->position;

                if ($newPosition > $oldPosition) {
                    // Moving down: shift tasks between old and new position up
                    Task::where('task_list_id', $task->task_list_id)
                        ->where('position', '>', $oldPosition)
                        ->where('position', '<=', $newPosition)
                        ->decrement('position');
                } elseif ($newPosition < $oldPosition) {
                    // Moving up: shift tasks between new and old position down
                    Task::where('task_list_id', $task->task_list_id)
                        ->where('position', '>=', $newPosition)
                        ->where('position', '<', $oldPosition)
                        ->increment('position');
                }

                $task->position = $newPosition;
            }

            unset($validated['position'], $validated['task_list_id']);
        }

        $task->fill($validated);
        $task->save();

        return redirect()->back();
    }

    /**
     * Xoá task
     */
    public function destroy(Project $project, TaskList $taskList, Task $task)
    {
        $this->ensureBelongs($project, $taskList, $task);

        $position = $task->position;
        $task->delete();

        // Shift remaining tasks up to close the gap
        Task::where('task_list_id', $taskList->id)
            ->where('position', '>', $position)
            ->decrement('position');

        return redirect()->back();
    }

    /**
     * Set label for task (only one label allowed)
     */
    public function toggleLabel(Request $request, Task $task)
    {
        $validated = $request->validate([
            'label_id' => 'required|exists:labels,id',
        ]);

        $labelId = $validated['label_id'];

        // Check if this label is already the only one attached
        $currentLabels = $task->labels()->pluck('label_id')->toArray();

        if (count($currentLabels) === 1 && $currentLabels[0] == $labelId) {
            // If clicking the same label, remove it (unselect)
            $task->labels()->detach($labelId);

            // Log activity with label metadata
            $label = \App\Models\Label::find($labelId);
            $task->logActivity('updated', "removed label '{$label->name->value}'", [
                'tags' => [
                    [
                        'name' => $label->name->value,
                        'color' => $label->color,
                        'removed' => true,
                    ],
                ],
            ]);
        } else {
            // Get old label if exists
            $oldLabel = count($currentLabels) > 0
                ? \App\Models\Label::find($currentLabels[0])
                : null;

            // Replace all labels with the new one (only one label allowed)
            $task->labels()->sync([$labelId]);

            // Log activity with label metadata
            $newLabel = \App\Models\Label::find($labelId);
            $tags = [];

            if ($oldLabel) {
                $tags[] = [
                    'name' => $oldLabel->name->value,
                    'color' => $oldLabel->color,
                    'removed' => true,
                ];
                $tags[] = [
                    'name' => $newLabel->name->value,
                    'color' => $newLabel->color,
                    'added' => true,
                ];
                $task->logActivity('updated', "changed label from '{$oldLabel->name->value}' to '{$newLabel->name->value}'", [
                    'tags' => $tags,
                ]);
            } else {
                $tags[] = [
                    'name' => $newLabel->name->value,
                    'color' => $newLabel->color,
                    'added' => true,
                ];
                $task->logActivity('updated', "added label '{$newLabel->name->value}'", [
                    'tags' => $tags,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Label updated successfully');
    }

    /**
     * Delete task from tasks index page (simpler route)
     */
    public function destroyFromIndex(Task $task)
    {
        $task->delete();

        return redirect()->back()->with('success', 'Task deleted successfully');
    }

    /**
     * Update task from tasks index page (simpler route without project/taskList context)
     */
    public function updateFromIndex(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'due_date' => 'nullable|date',
        ]);

        $task->update($validated);

        return redirect()->back()->with('success', 'Task updated successfully');
    }
}
