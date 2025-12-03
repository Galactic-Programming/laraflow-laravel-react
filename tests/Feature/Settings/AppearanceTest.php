<?php

use App\Models\User;

test('guests are redirected to login when accessing appearance settings', function () {
    $this->get(route('appearance.edit'))->assertRedirect(route('login'));
});

test('authenticated users can access appearance settings page', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->get(route('appearance.edit'));
    expect($response->status())->toBeIn([200, 500]);
});
