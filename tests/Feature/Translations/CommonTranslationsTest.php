<?php

test('nav translations exist in vietnamese', function () {
    $translations = include lang_path('vi/messages.php');

    expect($translations)->toHaveKey('nav');
    expect($translations['nav'])->toBeArray();
    expect($translations['nav'])->toHaveKeys([
        'home',
        'dashboard',
        'projects',
        'settings',
        'profile',
        'password',
        'appearance',
        'two_factor',
        'connections',
    ]);
});

test('nav translations exist in english', function () {
    $translations = include lang_path('en/messages.php');

    expect($translations)->toHaveKey('nav');
    expect($translations['nav'])->toBeArray();
    expect($translations['nav'])->toHaveKeys([
        'home',
        'dashboard',
        'projects',
        'settings',
        'profile',
        'password',
        'appearance',
        'two_factor',
        'connections',
    ]);
});

test('nav vietnamese translations are not empty', function () {
    $translations = include lang_path('vi/messages.php');

    foreach ($translations['nav'] as $key => $value) {
        expect($value)
            ->toBeString()
            ->not->toBeEmpty("Translation key 'nav.{$key}' should not be empty");
    }
});

test('nav translations are correct in vietnamese', function () {
    $viTranslations = include lang_path('vi/messages.php');

    expect($viTranslations['nav']['home'])->toBe('Trang chủ');
    expect($viTranslations['nav']['dashboard'])->toBe('Tổng quan');
    expect($viTranslations['nav']['projects'])->toBe('Dự án');
    expect($viTranslations['nav']['settings'])->toBe('Cài đặt');
});

test('common translations exist in vietnamese', function () {
    $translations = include lang_path('vi/messages.php');

    expect($translations)->toHaveKey('common');
    expect($translations['common'])->toBeArray();
    expect($translations['common'])->toHaveKeys([
        'save',
        'cancel',
        'delete',
        'confirm',
        'loading',
        'success',
        'error',
        'warning',
        'back',
        'continue',
        'submit',
    ]);
});

test('common translations exist in english', function () {
    $translations = include lang_path('en/messages.php');

    expect($translations)->toHaveKey('common');
    expect($translations['common'])->toBeArray();
    expect($translations['common'])->toHaveKeys([
        'save',
        'cancel',
        'delete',
        'confirm',
        'loading',
        'success',
        'error',
        'warning',
        'back',
        'continue',
        'submit',
    ]);
});

test('common vietnamese translations are correct', function () {
    $viTranslations = include lang_path('vi/messages.php');

    expect($viTranslations['common']['save'])->toBe('Lưu');
    expect($viTranslations['common']['cancel'])->toBe('Hủy');
    expect($viTranslations['common']['delete'])->toBe('Xóa');
    expect($viTranslations['common']['confirm'])->toBe('Xác nhận');
    expect($viTranslations['common']['loading'])->toBe('Đang tải...');
});

test('condition translations exist in vietnamese', function () {
    $translations = include lang_path('vi/messages.php');

    expect($translations)->toHaveKey('condition');
    expect($translations['condition'])->toBeArray();
    expect($translations['condition'])->toHaveKeys([
        'terms_title',
        'terms_desc',
        'privacy_title',
        'privacy_desc',
        'key_points',
    ]);
});

test('condition translations are correct in vietnamese', function () {
    $viTranslations = include lang_path('vi/messages.php');

    expect($viTranslations['condition']['terms_title'])->toBe('Điều khoản sử dụng');
    expect($viTranslations['condition']['privacy_title'])->toBe('Chính sách bảo mật');
});
