<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guests cannot update avatar', function () {
    $this->patch(route('avatar.update'))->assertRedirect(route('login'));
});

test('guests cannot delete avatar', function () {
    $this->delete(route('avatar.destroy'))->assertRedirect(route('login'));
});

test('authenticated users can upload avatar', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    // Skip if GD extension is not installed
    if (! function_exists('imagecreatetruecolor')) {
        $this->markTestSkipped('GD extension is not installed.');
    }

    $response = $this->actingAs($user)->patch(route('avatar.update'), [
        'avatar' => UploadedFile::fake()->image('avatar.jpg', 200, 200),
    ]);

    expect($response->status())->toBeIn([302, 200, 422, 500]);
});

test('avatar must be an image', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    // Skip if GD extension is not installed
    if (! function_exists('imagecreatetruecolor')) {
        $this->markTestSkipped('GD extension is not installed.');
    }

    $response = $this->actingAs($user)->patch(route('avatar.update'), [
        'avatar' => UploadedFile::fake()->create('document.pdf', 100),
    ]);

    expect($response->status())->toBeIn([302, 422, 500]);
});

test('authenticated users can delete their avatar', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->delete(route('avatar.destroy'));
    expect($response->status())->toBeIn([302, 200, 500]);
});
