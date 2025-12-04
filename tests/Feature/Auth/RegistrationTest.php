<?php

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertStatus(200);
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'Zy7@nHw3!kRt',
        'password_confirmation' => 'Zy7@nHw3!kRt',
        'terms' => true,
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('new users cannot register without accepting terms', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'Zy7@nHw3!kRt',
        'password_confirmation' => 'Zy7@nHw3!kRt',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('terms');
});

test('terms field must be accepted', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'Zy7@nHw3!kRt',
        'password_confirmation' => 'Zy7@nHw3!kRt',
        'terms' => false,
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('terms');
});
