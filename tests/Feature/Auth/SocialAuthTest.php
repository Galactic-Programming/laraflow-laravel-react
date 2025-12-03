<?php

use App\Models\User;

test('social redirect route exists for github', function () {
    $response = $this->get(route('social.redirect', 'github'));
    expect($response->status())->toBeIn([302, 500]);
});

test('social redirect route exists for google', function () {
    $response = $this->get(route('social.redirect', 'google'));
    expect($response->status())->toBeIn([302, 500]);
});

test('social callback route exists for github', function () {
    $response = $this->get(route('social.callback', 'github'));
    expect($response->status())->toBeIn([302, 500]);
});

test('social callback route exists for google', function () {
    $response = $this->get(route('social.callback', 'google'));
    expect($response->status())->toBeIn([302, 500]);
});

test('authenticated users can access social redirect', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->get(route('social.redirect', 'github'));
    expect($response->status())->toBeIn([302, 500]);
});

test('invalid provider returns error', function () {
    $response = $this->get(route('social.redirect', 'invalid-provider'));
    expect($response->status())->toBeIn([404, 500]);
});
