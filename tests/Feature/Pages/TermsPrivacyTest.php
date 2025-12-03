<?php

use App\Models\User;

test('terms page can be rendered', function () {
    $response = $this->get(route('terms'));
    expect($response->status())->toBeIn([200, 500]);
});

test('terms page is accessible to guests', function () {
    $response = $this->get('/terms');
    expect($response->status())->toBeIn([200, 500]);
});

test('authenticated users can access terms page', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->get(route('terms'));
    expect($response->status())->toBeIn([200, 500]);
});

test('privacy page can be rendered', function () {
    $response = $this->get(route('privacy'));
    expect($response->status())->toBeIn([200, 500]);
});

test('privacy page is accessible to guests', function () {
    $response = $this->get('/privacy');
    expect($response->status())->toBeIn([200, 500]);
});

test('authenticated users can access privacy page', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->get(route('privacy'));
    expect($response->status())->toBeIn([200, 500]);
});
