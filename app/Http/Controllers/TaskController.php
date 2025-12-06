<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Http\Request;

class TaskController extends Controller
{
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

        return response()->json([
            'message' => 'Task updated successfully',
            'task' => $task,
        ]);
    }

    /**
     * Xoá task
     */
    public function destroy(Project $project, TaskList $taskList, Task $task)
    {
        $this->ensureBelongs($project, $taskList, $task);

        $task->delete();

        return response()->noContent();
    }
}
