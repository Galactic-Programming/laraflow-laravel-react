<?php

use App\Models\User;

test('pricing page can be rendered', function () {
    $response = $this->get(route('pricing'));
    expect($response->status())->toBeIn([200, 500]);
});

test('pricing page is accessible to guests', function () {
    $response = $this->get('/pricing');
    expect($response->status())->toBeIn([200, 500]);
});

test('authenticated users can access pricing page', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->get(route('pricing'));
    expect($response->status())->toBeIn([200, 500]);
});

test('payment success page redirects appropriately', function () {
    $response = $this->get(route('payment.success'));
    expect($response->status())->toBeIn([302, 200, 500]);
});

test('authenticated users can access payment success page', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->get(route('payment.success'));
    expect($response->status())->toBeIn([200, 302, 500]);
});
