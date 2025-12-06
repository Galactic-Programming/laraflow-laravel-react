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
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'color' => ['required', 'string', 'max:7'],
            'position' => ['sometimes', 'integer', 'min:0'],
        ]);

        // If position is provided (e.g., 0 for top), shift existing items
        if (isset($validated['position'])) {
            $project->taskLists()
                ->where('position', '>=', $validated['position'])
                ->increment('position');
        } else {
            // Default: add to end
            $maxPosition = $project->taskLists()->max('position') ?? -1;
            $validated['position'] = $maxPosition + 1;
        }

        $project->taskLists()->create($validated);

        return back();
    }

    public function update(Request $request, Project $project, TaskList $taskList): RedirectResponse
    {
        // Ensure user owns the project
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'color' => ['sometimes', 'required', 'string', 'max:7'],
            'position' => ['sometimes', 'integer', 'min:0'],
        ]);

        // Handle position reordering
        if (isset($validated['position'])) {
            $oldPosition = $taskList->position;
            $newPosition = $validated['position'];

            if ($oldPosition !== $newPosition) {
                if ($newPosition < $oldPosition) {
                    // Moving left: shift items between new and old position to the right
                    $project->taskLists()
                        ->where('id', '!=', $taskList->id)
                        ->where('position', '>=', $newPosition)
                        ->where('position', '<', $oldPosition)
                        ->increment('position');
                } else {
                    // Moving right: shift items between old and new position to the left
                    $project->taskLists()
                        ->where('id', '!=', $taskList->id)
                        ->where('position', '>', $oldPosition)
                        ->where('position', '<=', $newPosition)
                        ->decrement('position');
                }
            }
        }

        $taskList->update($validated);

        return back();
    }

    public function destroy(Project $project, TaskList $taskList): RedirectResponse
    {
        // Ensure user owns the project
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }

        $taskList->delete();

        return back();
    }
}
