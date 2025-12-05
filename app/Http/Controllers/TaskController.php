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
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'due_date' => 'nullable|date',
        ]);

        $task->update($validated);

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
