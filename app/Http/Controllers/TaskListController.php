<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\TaskList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TaskListController extends Controller
{
    public function store(Request $request, Project $project): RedirectResponse
    {
        // Ensure user owns the project
        abort_unless($project->user_id === auth()->id(), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'color' => ['required', 'string', 'max:7'],
        ]);

        // Get max position for ordering
        $maxPosition = $project->taskLists()->max('position') ?? -1;
        $validated['position'] = $maxPosition + 1;

        $project->taskLists()->create($validated);

        return back();
    }

    public function update(Request $request, Project $project, TaskList $task_list): RedirectResponse
    {
        // Ensure user owns the project and task list belongs to project
        abort_unless($project->user_id === auth()->id() && $task_list->project_id === $project->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'color' => ['required', 'string', 'max:7'],
        ]);

        $task_list->update($validated);

        return back();
    }

    public function destroy(Project $project, TaskList $task_list): RedirectResponse
    {
        // Ensure user owns the project and task list belongs to project
        abort_unless($project->user_id === auth()->id() && $task_list->project_id === $project->id, 403);

        $task_list->delete();

        return back();
    }

    public function reorder(Request $request, Project $project): RedirectResponse
    {
        // Ensure user owns the project
        abort_unless($project->user_id === auth()->id(), 403);

        $validated = $request->validate([
            'task_lists' => ['required', 'array'],
            'task_lists.*.id' => ['required', 'integer', 'exists:task_lists,id'],
            'task_lists.*.position' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['task_lists'] as $item) {
            TaskList::where('id', $item['id'])
                ->where('project_id', $project->id)
                ->update(['position' => $item['position']]);
        }

        return back();
    }
}
