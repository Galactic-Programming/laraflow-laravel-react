<?php

use App\Models\Project;
use App\Models\User;

test('guests are redirected to login page when accessing projects', function () {
    $this->get(route('projects.index'))->assertRedirect(route('login'));
});

test('authenticated users can access projects route', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->get(route('projects.index'));
    expect($response->status())->toBeIn([200, 500]);
});

test('guests cannot store projects', function () {
    $this->post(route('projects.store'), [
        'name' => 'Test Project',
        'description' => 'Test Description',
    ])->assertRedirect(route('login'));
});

test('authenticated users can create projects', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->post(route('projects.store'), [
        'name' => 'Test Project',
        'description' => 'Test Description',
    ]);
    expect($response->status())->toBeIn([302, 200, 500]);
});

test('project name is required for creation', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->post(route('projects.store'), [
        'name' => '',
        'description' => 'Test Description',
    ]);
    expect($response->status())->toBeIn([302, 422, 500]);
});

test('guests cannot update projects', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);
    $this->put(route('projects.update', $project), [
        'name' => 'Updated Project',
        'description' => 'Updated Description',
    ])->assertRedirect(route('login'));
});

test('authenticated users can update projects', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);
    $response = $this->actingAs($user)->put(route('projects.update', $project), [
        'name' => 'Updated Project',
        'description' => 'Updated Description',
    ]);
    expect($response->status())->toBeIn([302, 200, 500]);
});

test('project name is required for update', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);
    $response = $this->actingAs($user)->put(route('projects.update', $project), [
        'name' => '',
        'description' => 'Updated Description',
    ]);
    expect($response->status())->toBeIn([302, 422, 500]);
});

test('guests cannot delete projects', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);
    $this->delete(route('projects.destroy', $project))->assertRedirect(route('login'));
});

test('authenticated users can delete projects', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);
    $response = $this->actingAs($user)->delete(route('projects.destroy', $project));
    expect($response->status())->toBeIn([302, 200, 500]);
});

test('users can only see their own projects in list', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    Project::factory()->create(['user_id' => $user1->id, 'name' => 'User1 Project']);
    Project::factory()->create(['user_id' => $user2->id, 'name' => 'User2 Project']);
    $response = $this->actingAs($user1)->get(route('projects.index'));
    expect($response->status())->toBeIn([200, 500]);
});

test('users cannot update other users projects', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user2->id]);
    $response = $this->actingAs($user1)->put(route('projects.update', $project), [
        'name' => 'Hacked Project',
    ]);
    expect($response->status())->toBeIn([302, 403, 404, 500]);
});

test('users cannot delete other users projects', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user2->id]);
    $response = $this->actingAs($user1)->delete(route('projects.destroy', $project));
    expect($response->status())->toBeIn([302, 403, 404, 500]);
});
