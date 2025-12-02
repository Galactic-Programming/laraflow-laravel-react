<?php

use App\Http\Middleware\SetLocale;

test('locale can be switched to vietnamese', function () {
    $response = $this->post('/locale/vi');

    $response->assertRedirect();
    $response->assertCookie('locale', 'vi', false);
});

test('locale can be switched to english', function () {
    $response = $this->post('/locale/en');

    $response->assertRedirect();
    $response->assertCookie('locale', 'en', false);
});

test('invalid locale returns error', function () {
    $response = $this->post('/locale/invalid');

    $response->assertStatus(400);
});

test('available locales constant has english and vietnamese', function () {
    expect(SetLocale::AVAILABLE_LOCALES)->toBe([
        'en' => 'English',
        'vi' => 'Tiếng Việt',
    ]);
});

test('set locale middleware sets app locale from cookie', function () {
    $this->withUnencryptedCookie('locale', 'vi')
        ->get('/')
        ->assertSuccessful();

    expect(app()->getLocale())->toBe('vi');
});

test('set locale middleware defaults to english', function () {
    $this->get('/')
        ->assertSuccessful();

    expect(app()->getLocale())->toBe('en');
});

test('translation files exist for both locales', function () {
    expect(lang_path('en/messages.php'))->toBeFile();
    expect(lang_path('vi/messages.php'))->toBeFile();
});

test('translations are shared via inertia', function () {
    $response = $this->get('/');

    $response->assertInertia(
        fn($page) => $page
            ->has('locale')
            ->has('availableLocales')
            ->has('translations')
    );
});
