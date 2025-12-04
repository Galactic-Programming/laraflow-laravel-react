<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(): Response
    {
        $projects = auth()->user()->projects()->latest()->get();

        return Inertia::render('projects/index', [
            'projects' => $projects,
        ]);
    }

    public function show(int $id): Response
    {
        $project = auth()->user()->projects()
            ->with(['taskLists.tasks'])
            ->findOrFail($id);

        return Inertia::render('projects/show', [
            'project' => $project,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'color' => ['required', 'string', 'max:7'],
            'icon' => ['nullable', 'string', 'max:50'],
            'visibility' => ['required', 'in:private,public'],
        ]);

        $project = auth()->user()->projects()->create($validated);

        // Create default task lists (kanban columns)
        $defaultColumns = [
            ['name' => 'Pending', 'color' => '#6b7280', 'position' => 0],
            ['name' => 'In Progress', 'color' => '#3b82f6', 'position' => 1],
            ['name' => 'Completed', 'color' => '#f59e0b', 'position' => 2],
            ['name' => 'Cancelled', 'color' => '#10b981', 'position' => 3],
        ];

        foreach ($defaultColumns as $column) {
            $project->taskLists()->create($column);
        }

        return redirect()->route('projects.index');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'color' => ['required', 'string', 'max:7'],
            'icon' => ['nullable', 'string', 'max:50'],
            'visibility' => ['required', 'in:private,public'],
        ]);

        $project = auth()->user()->projects()->findOrFail($id);
        $project->update($validated);

        return redirect()->route('projects.index');
    }

    public function destroy(int $id): RedirectResponse
    {
        $project = auth()->user()->projects()->findOrFail($id);
        $project->delete();

        return redirect()->route('projects.index');
    }

    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:active,completed,archived'],
        ]);

        $project = auth()->user()->projects()->findOrFail($id);
        $project->update($validated);

        return redirect()->route('projects.index');
    }
}
