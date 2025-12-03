<?php

test('auth translations exist in vietnamese', function () {
    $translations = include lang_path('vi/messages.php');

    expect($translations)->toHaveKey('auth');
    expect($translations['auth'])->toBeArray();
    expect($translations['auth'])->toHaveKeys([
        'login',
        'register',
        'logout',
        'forgot_password',
        'reset_password',
        'confirm_password',
        'email',
        'password',
        'remember_me',
        'welcome_back',
        'create_account',
        'full_name',
        'already_have_account',
        'no_account',
        'two_factor_title',
        'verify_email',
    ]);
});

test('auth translations exist in english', function () {
    $translations = include lang_path('en/messages.php');

    expect($translations)->toHaveKey('auth');
    expect($translations['auth'])->toBeArray();
    expect($translations['auth'])->toHaveKeys([
        'login',
        'register',
        'logout',
        'forgot_password',
        'reset_password',
        'confirm_password',
        'email',
        'password',
        'remember_me',
        'welcome_back',
        'create_account',
        'full_name',
        'already_have_account',
        'no_account',
        'two_factor_title',
        'verify_email',
    ]);
});

test('auth vietnamese translations are not empty', function () {
    $translations = include lang_path('vi/messages.php');

    foreach ($translations['auth'] as $key => $value) {
        expect($value)
            ->toBeString()
            ->not->toBeEmpty("Translation key 'auth.{$key}' should not be empty");
    }
});

test('auth login translation is correct', function () {
    $viTranslations = include lang_path('vi/messages.php');
    $enTranslations = include lang_path('en/messages.php');

    expect($viTranslations['auth']['login'])->toBe('Đăng nhập');
    expect($enTranslations['auth']['login'])->toBe('Log in');
});

test('auth register translation is correct', function () {
    $viTranslations = include lang_path('vi/messages.php');
    $enTranslations = include lang_path('en/messages.php');

    expect($viTranslations['auth']['register'])->toBe('Đăng ký');
    expect($enTranslations['auth']['register'])->toBe('Register');
});

test('auth two factor translations exist', function () {
    $viTranslations = include lang_path('vi/messages.php');

    expect($viTranslations['auth'])->toHaveKeys([
        'two_factor_title',
        'two_factor_desc',
        'enter_code',
        'use_recovery_code',
        'recovery_code',
    ]);
});
