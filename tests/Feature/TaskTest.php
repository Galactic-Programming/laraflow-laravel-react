<?php

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->project = Project::factory()->for($this->user)->create();
    $this->taskList = TaskList::factory()->for($this->project)->create();
});

test('user can create a task', function () {
    $response = $this->actingAs($this->user)->post(
        "/projects/{$this->project->id}/tasks",
        [
            'task_list_id' => $this->taskList->id,
            'title' => 'New Task',
            'description' => 'A test task description',
            'priority' => 'high',
            'status' => 'in_progress',
            'due_date' => '2025-12-31',
        ],
    );

    $response->assertRedirect();

    $this->assertDatabaseHas('tasks', [
        'task_list_id' => $this->taskList->id,
        'title' => 'New Task',
        'description' => 'A test task description',
        'priority' => 'high',
        'status' => 'in_progress',
        'due_date' => '2025-12-31 00:00:00',
        'created_by' => $this->user->id,
        'position' => 0,
    ]);
});

test('task creation requires valid task list', function () {
    $response = $this->actingAs($this->user)->post(
        "/projects/{$this->project->id}/tasks",
        [
            'task_list_id' => 999, // Non-existent task list
            'title' => 'New Task',
            'priority' => 'medium',
            'status' => 'pending',
        ],
    );

    $response->assertRedirect();
    $response->assertSessionHasErrors('task_list_id');
});

test('task creation requires title', function () {
    $response = $this->actingAs($this->user)->post(
        "/projects/{$this->project->id}/tasks",
        [
            'task_list_id' => $this->taskList->id,
            'title' => '',
            'priority' => 'medium',
            'status' => 'pending',
        ],
    );

    $response->assertRedirect();
    $response->assertSessionHasErrors('title');
});

test('task creation validates priority and status', function () {
    $response = $this->actingAs($this->user)->post(
        "/projects/{$this->project->id}/tasks",
        [
            'task_list_id' => $this->taskList->id,
            'title' => 'Test Task',
            'priority' => 'invalid',
            'status' => 'invalid',
        ],
    );

    $response->assertRedirect();
    $response->assertSessionHasErrors(['priority', 'status']);
});

test('task position is set correctly', function () {
    // Create first task
    Task::factory()->for($this->taskList)->create([
        'position' => 0,
        'created_by' => $this->user->id,
    ]);

    // Create second task
    $response = $this->actingAs($this->user)->post(
        "/projects/{$this->project->id}/tasks",
        [
            'task_list_id' => $this->taskList->id,
            'title' => 'Second Task',
            'priority' => 'medium',
            'status' => 'pending',
        ],
    );

    $response->assertRedirect();

    $this->assertDatabaseHas('tasks', [
        'task_list_id' => $this->taskList->id,
        'title' => 'Second Task',
        'position' => 1,
    ]);
});
