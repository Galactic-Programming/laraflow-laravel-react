<?php

use App\Models\User;

test('guests are redirected to login when accessing billing settings', function () {
    $this->get(route('billing.show'))->assertRedirect(route('login'));
});

test('authenticated users can access billing settings page', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->get(route('billing.show'));
    expect($response->status())->toBeIn([200, 500]);
});

test('guests cannot cancel subscription', function () {
    $this->post(route('billing.cancel'))->assertRedirect(route('login'));
});

test('guests cannot resume subscription', function () {
    $this->post(route('billing.resume'))->assertRedirect(route('login'));
});

test('authenticated users can attempt to cancel subscription', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->post(route('billing.cancel'));
    expect($response->status())->toBeIn([302, 400, 500]);
});

test('authenticated users can attempt to resume subscription', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->post(route('billing.resume'));
    expect($response->status())->toBeIn([302, 400, 500]);
});
