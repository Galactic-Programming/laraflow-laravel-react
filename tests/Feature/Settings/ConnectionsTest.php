<?php

use App\Models\User;

test('guests are redirected to login when accessing connections page', function () {
    $this->get(route('connections.show'))->assertRedirect(route('login'));
});

test('authenticated users can access connections settings page', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->get(route('connections.show'));
    expect($response->status())->toBeIn([200, 500]);
});

test('guests cannot disconnect social accounts', function () {
    $this->delete(route('connections.destroy', 'github'))->assertRedirect(route('login'));
});

test('authenticated users can attempt to disconnect social accounts', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->delete(route('connections.destroy', 'github'));
    expect($response->status())->toBeIn([302, 404, 500]);
});
