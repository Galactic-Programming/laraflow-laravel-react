<?php

use App\Models\Project;
use App\Models\TaskList;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->project = Project::factory()->for($this->user)->create();
});

test('user can create a task list', function () {
    $response = $this->actingAs($this->user)->post(
        "/projects/{$this->project->id}/task-lists",
        [
            'name' => 'New Column',
            'description' => 'A test description',
            'color' => '#ff0000',
        ],
    );

    $response->assertRedirect();

    $this->assertDatabaseHas('task_lists', [
        'project_id' => $this->project->id,
        'name' => 'New Column',
        'description' => 'A test description',
        'color' => '#ff0000',
    ]);
});

test('user can update a task list', function () {
    $taskList = TaskList::factory()->for($this->project)->create([
        'name' => 'Original Name',
        'color' => '#000000',
    ]);

    $response = $this->actingAs($this->user)->put(
        "/projects/{$this->project->id}/task-lists/{$taskList->id}",
        [
            'name' => 'Updated Name',
            'description' => 'Updated description',
            'color' => '#ffffff',
        ],
    );

    $response->assertRedirect();

    $this->assertDatabaseHas('task_lists', [
        'id' => $taskList->id,
        'name' => 'Updated Name',
        'description' => 'Updated description',
        'color' => '#ffffff',
    ]);
});

test('user can delete a task list', function () {
    $taskList = TaskList::factory()->for($this->project)->create();

    $response = $this->actingAs($this->user)->delete(
        "/projects/{$this->project->id}/task-lists/{$taskList->id}",
    );

    $response->assertRedirect();

    $this->assertDatabaseMissing('task_lists', [
        'id' => $taskList->id,
    ]);
});

test('user can reorder task lists', function () {
    $taskList1 = TaskList::factory()->for($this->project)->create(['position' => 0]);
    $taskList2 = TaskList::factory()->for($this->project)->create(['position' => 1]);
    $taskList3 = TaskList::factory()->for($this->project)->create(['position' => 2]);

    $response = $this->actingAs($this->user)->post(
        "/projects/{$this->project->id}/task-lists/reorder",
        [
            'task_lists' => [
                ['id' => $taskList3->id, 'position' => 0],
                ['id' => $taskList1->id, 'position' => 1],
                ['id' => $taskList2->id, 'position' => 2],
            ],
        ],
    );

    $response->assertRedirect();

    $this->assertDatabaseHas('task_lists', ['id' => $taskList3->id, 'position' => 0]);
    $this->assertDatabaseHas('task_lists', ['id' => $taskList1->id, 'position' => 1]);
    $this->assertDatabaseHas('task_lists', ['id' => $taskList2->id, 'position' => 2]);
});

test('user cannot modify task lists of another users project', function () {
    $otherUser = User::factory()->create();
    $otherProject = Project::factory()->for($otherUser)->create();
    $taskList = TaskList::factory()->for($otherProject)->create();

    // Try to update
    $this->actingAs($this->user)
        ->put("/projects/{$otherProject->id}/task-lists/{$taskList->id}", [
            'name' => 'Hacked',
            'description' => null,
            'color' => '#000000',
        ])
        ->assertForbidden();

    // Try to delete
    $this->actingAs($this->user)
        ->delete("/projects/{$otherProject->id}/task-lists/{$taskList->id}")
        ->assertForbidden();
});

test('creating a new project creates 4 default task lists', function () {
    $response = $this->actingAs($this->user)->post('/projects', [
        'name' => 'Test Project',
        'description' => 'Test description',
        'color' => '#3b82f6',
        'icon' => 'folder',
        'visibility' => 'private',
    ]);

    $response->assertRedirect();

    $project = Project::where('name', 'Test Project')->first();

    expect($project->taskLists)->toHaveCount(4);

    $columnNames = $project->taskLists->pluck('name')->toArray();
    expect($columnNames)->toContain('To Do', 'In Progress', 'Review', 'Done');
});
