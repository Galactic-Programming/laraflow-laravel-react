<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\AuthorizesProjectOwnership;
use App\Http\Controllers\Concerns\ManagesPositions;
use App\Models\Project;
use App\Models\TaskList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TaskListController extends Controller
{
    use AuthorizesProjectOwnership;
    use ManagesPositions;
    public function store(Request $request, Project $project): RedirectResponse
    {
        $this->authorizeProjectOwnership($project);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'color' => ['required', 'string', 'max:7'],
            'position' => ['sometimes', 'integer', 'min:0'],
        ]);

        // If position is provided (e.g., 0 for top), shift existing items
        if (isset($validated['position'])) {
            $this->makeRoomAtPosition($project->taskLists(), $validated['position']);
        } else {
            // Default: add to end
            $validated['position'] = $this->getNextPosition($project->taskLists());
        }

        $project->taskLists()->create($validated);

        return back();
    }

    public function update(Request $request, Project $project, TaskList $taskList): RedirectResponse
    {
        $this->authorizeProjectOwnership($project);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'color' => ['sometimes', 'required', 'string', 'max:7'],
            'position' => ['sometimes', 'integer', 'min:0'],
        ]);

        // Handle position reordering
        if (isset($validated['position'])) {
            $this->reorderPositions(
                $project->taskLists(),
                $taskList->position,
                $validated['position'],
                $taskList->id
            );
        }

        $taskList->update($validated);

        return back();
    }

    public function destroy(Project $project, TaskList $taskList): RedirectResponse
    {
        $this->authorizeProjectOwnership($project);

        $taskList->delete();

        return back();
    }
}
