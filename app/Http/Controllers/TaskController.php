<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function store(StoreTaskRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Get the highest position in the task list
        $maxPosition = Task::where('task_list_id', $validated['task_list_id'])
            ->max('position') ?? -1;

        $task = Task::create([
            'task_list_id' => $validated['task_list_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'],
            'status' => $validated['status'],
            'position' => $maxPosition + 1,
            'due_date' => $validated['due_date'] ?? null,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'created_by' => Auth::id(),
        ]);

        return redirect()->back()
            ->with('success', 'Task created successfully!');
    }

    public function update(Request $request, int $projectId, int $taskId): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['required', 'string', 'in:low,medium,high'],
            'status' => ['required', 'string', 'in:pending,in_progress,completed,cancelled'],
            'due_date' => ['nullable', 'date'],
        ]);

        $task = Task::where('id', $taskId)
            ->whereHas('taskList', function ($query) use ($projectId) {
                $query->where('project_id', $projectId);
            })
            ->firstOrFail();

        $updateData = [
            'title' => $validated['title'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'status' => $validated['status'],
            'due_date' => $validated['due_date'],
        ];

        // Handle status change - move to appropriate task list
        if ($validated['status'] !== $task->status) {
            $statusToListMap = [
                'pending' => 'pending',
                'in_progress' => 'in_progress',
                'completed' => 'completed',
                'cancelled' => 'cancelled',
            ];

            $targetListName = $statusToListMap[$validated['status']] ?? null;
            $targetList = TaskList::where('project_id', $projectId)
                ->where('name', $targetListName)
                ->first();

            if ($targetList && $targetList->id !== $task->task_list_id) {
                $maxPosition = Task::where('task_list_id', $targetList->id)
                    ->max('position') ?? -1;

                $updateData['task_list_id'] = $targetList->id;
                $updateData['position'] = $maxPosition + 1;
            }

            // Set completed_at
            if ($validated['status'] === 'completed' && $task->status !== 'completed') {
                $updateData['completed_at'] = now();
            } elseif ($validated['status'] !== 'completed') {
                $updateData['completed_at'] = null;
            }
        }

        $task->update($updateData);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Task updated successfully!',
                'task' => $task->fresh(),
            ]);
        }

        return redirect()->back()
            ->with('success', 'Task updated successfully!');
    }

    public function complete(int $projectId, int $taskId): RedirectResponse
    {
        $task = Task::where('id', $taskId)
            ->whereHas('taskList', function ($query) use ($projectId) {
                $query->where('project_id', $projectId);
            })
            ->firstOrFail();

        // Find the "Completed" task list in the same project
        $completedTaskList = TaskList::where('project_id', $projectId)
            ->where('name', 'Completed')
            ->first();

        $updateData = [
            'status' => 'completed',
            'completed_at' => now(),
        ];

        // If "Completed" task list exists, move the task there
        if ($completedTaskList) {
            // Get the highest position in the completed task list
            $maxPosition = Task::where('task_list_id', $completedTaskList->id)
                ->max('position') ?? -1;

            $updateData['task_list_id'] = $completedTaskList->id;
            $updateData['position'] = $maxPosition + 1;
        }

        $task->update($updateData);

        return redirect()->back()
            ->with('success', 'Task completed successfully!');
    }

    public function duplicate(int $projectId, int $taskId): RedirectResponse
    {
        $task = Task::where('id', $taskId)
            ->whereHas('taskList', function ($query) use ($projectId) {
                $query->where('project_id', $projectId);
            })
            ->firstOrFail();

        // Get the highest position in the task list
        $maxPosition = Task::where('task_list_id', $task->task_list_id)
            ->max('position') ?? -1;

        Task::create([
            'task_list_id' => $task->task_list_id,
            'title' => $task->title.' (Copy)',
            'description' => $task->description,
            'priority' => $task->priority,
            'status' => $task->status,
            'position' => $maxPosition + 1,
            'due_date' => $task->due_date,
            'assigned_to' => $task->assigned_to,
            'created_by' => Auth::id(),
        ]);

        return redirect()->back()
            ->with('success', 'Task duplicated successfully!');
    }

    public function reorder(Request $request, int $projectId): RedirectResponse
    {
        $validated = $request->validate([
            'tasks' => ['required', 'array'],
            'tasks.*.id' => ['required', 'integer'],
            'tasks.*.position' => ['required', 'integer', 'min:0'],
            'tasks.*.task_list_id' => ['sometimes', 'integer'],
        ]);

        foreach ($validated['tasks'] as $taskData) {
            $updateData = ['position' => $taskData['position']];
            
            // If task_list_id is provided, also update the list
            if (isset($taskData['task_list_id'])) {
                $updateData['task_list_id'] = $taskData['task_list_id'];
            }
            
            Task::where('id', $taskData['id'])
                ->whereHas('taskList', function ($query) use ($projectId) {
                    $query->where('project_id', $projectId);
                })
                ->update($updateData);
        }

        return redirect()->back()
            ->with('success', 'Tasks reordered successfully!');
    }

    public function move(Request $request, int $projectId, int $taskId): RedirectResponse
    {
        $validated = $request->validate([
            'task_list_id' => ['required', 'integer', 'exists:task_lists,id'],
            'position' => ['required', 'integer', 'min:0'],
        ]);

        $task = Task::where('id', $taskId)
            ->whereHas('taskList', function ($query) use ($projectId) {
                $query->where('project_id', $projectId);
            })
            ->firstOrFail();

        // Verify the target task list belongs to the same project
        $targetList = TaskList::where('id', $validated['task_list_id'])
            ->where('project_id', $projectId)
            ->firstOrFail();

        // Determine status based on target list name
        $statusMap = [
            'Pending' => 'pending',
            'In Progress' => 'in_progress',
            'Completed' => 'completed',
            'Cancelled' => 'cancelled',
        ];
        
        $newStatus = $statusMap[$targetList->name] ?? $task->status;
        
        $updateData = [
            'task_list_id' => $validated['task_list_id'],
            'position' => $validated['position'],
            'status' => $newStatus,
        ];
        
        // Set completed_at if moving to Completed
        if ($newStatus === 'completed' && $task->status !== 'completed') {
            $updateData['completed_at'] = now();
        } elseif ($newStatus !== 'completed') {
            $updateData['completed_at'] = null;
        }

        // Update task
        $task->update($updateData);

        return redirect()->back()
            ->with('success', 'Task moved successfully!');
    }

    public function destroy(int $projectId, int $taskId): RedirectResponse
    {
        $task = Task::where('id', $taskId)
            ->whereHas('taskList', function ($query) use ($projectId) {
                $query->where('project_id', $projectId);
            })
            ->firstOrFail();

        $task->delete();

        return redirect()->back()
            ->with('success', 'Task deleted successfully!');
    }

    public function updateStatus(Request $request, int $projectId, int $taskId): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,in_progress,completed,cancelled'],
        ]);

        $task = Task::where('id', $taskId)
            ->whereHas('taskList', function ($query) use ($projectId) {
                $query->where('project_id', $projectId);
            })
            ->firstOrFail();

        // Find the matching task list for the new status
        $statusToListMap = [
            'pending' => 'pending',
            'in_progress' => 'in_progress',
            'completed' => 'completed',
            'cancelled' => 'cancelled',
        ];

        $targetListName = $statusToListMap[$validated['status']] ?? null;
        $targetList = TaskList::where('project_id', $projectId)
            ->where('name', $targetListName)
            ->first();

        $updateData = [
            'status' => $validated['status'],
        ];

        // Set completed_at if changing to completed
        if ($validated['status'] === 'completed' && $task->status !== 'completed') {
            $updateData['completed_at'] = now();
        } elseif ($validated['status'] !== 'completed') {
            $updateData['completed_at'] = null;
        }

        // If matching task list exists, move the task there
        if ($targetList && $targetList->id !== $task->task_list_id) {
            $maxPosition = Task::where('task_list_id', $targetList->id)
                ->max('position') ?? -1;

            $updateData['task_list_id'] = $targetList->id;
            $updateData['position'] = $maxPosition + 1;
        }

        $task->update($updateData);

        // Return JSON for AJAX requests
        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Task status updated successfully!',
                'task' => $task->fresh(),
            ]);
        }

        return redirect()->back()
            ->with('success', 'Task status updated successfully!');
    }
}
