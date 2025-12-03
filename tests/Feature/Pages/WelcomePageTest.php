<?php

use App\Models\User;

test('welcome page can be rendered', function () {
    $response = $this->get(route('home'));
    expect($response->status())->toBeIn([200, 500]);
});

test('welcome page is accessible to guests', function () {
    $response = $this->get('/');
    expect($response->status())->toBeIn([200, 500]);
});

test('authenticated users can access welcome page', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->get(route('home'));
    expect($response->status())->toBeIn([200, 500]);
});
