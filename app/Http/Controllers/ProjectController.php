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

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'color' => ['required', 'string', 'max:7'],
            'icon' => ['nullable', 'string', 'max:50'],
            'visibility' => ['required', 'in:private,public'],
        ]);

        auth()->user()->projects()->create($validated);

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
}
