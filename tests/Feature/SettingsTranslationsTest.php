<?php

test('settings translations exist in vietnamese', function () {
    $translations = include lang_path('vi/messages.php');

    expect($translations)->toHaveKey('settings');
    expect($translations['settings'])->toBeArray();
    expect($translations['settings'])->toHaveKeys([
        'title',
        'description',
        'profile',
        'password',
        'two_factor',
        'appearance',
        'connections',
        'profile_info',
        'update_password',
        'delete_account',
        'current_password',
        'new_password',
        'confirm_password',
        'saved',
    ]);
});

test('settings translations exist in english', function () {
    $translations = include lang_path('en/messages.php');

    expect($translations)->toHaveKey('settings');
    expect($translations['settings'])->toBeArray();
    expect($translations['settings'])->toHaveKeys([
        'title',
        'description',
        'profile',
        'password',
        'two_factor',
        'appearance',
        'connections',
        'profile_info',
        'update_password',
        'delete_account',
        'current_password',
        'new_password',
        'confirm_password',
        'saved',
    ]);
});

test('settings vietnamese translations are not empty', function () {
    $translations = include lang_path('vi/messages.php');

    foreach ($translations['settings'] as $key => $value) {
        expect($value)
            ->toBeString()
            ->not->toBeEmpty("Translation key 'settings.{$key}' should not be empty");
    }
});

test('settings title translation is correct', function () {
    $viTranslations = include lang_path('vi/messages.php');
    $enTranslations = include lang_path('en/messages.php');

    expect($viTranslations['settings']['title'])->toBe('Cài đặt');
    expect($enTranslations['settings']['title'])->toBe('Settings');
});

test('settings two factor translations exist', function () {
    $viTranslations = include lang_path('vi/messages.php');

    expect($viTranslations['settings'])->toHaveKeys([
        '2fa_active',
        'disable_2fa',
        'enable_2fa',
        'authenticator_app',
        'recovery_codes',
    ]);
});

test('settings theme translations exist', function () {
    $viTranslations = include lang_path('vi/messages.php');

    expect($viTranslations['settings'])->toHaveKeys([
        'light',
        'dark',
        'system',
    ]);

    expect($viTranslations['settings']['light'])->toBe('Sáng');
    expect($viTranslations['settings']['dark'])->toBe('Tối');
    expect($viTranslations['settings']['system'])->toBe('Theo hệ thống');
});

test('settings delete account translations exist', function () {
    $viTranslations = include lang_path('vi/messages.php');

    expect($viTranslations['settings'])->toHaveKeys([
        'delete_account',
        'delete_account_desc',
        'delete_account_btn',
        'delete_confirm_title',
        'delete_confirm_desc',
    ]);
});
