<?php

test('auth translation file exists for vietnamese', function () {
    expect(lang_path('vi/auth.php'))->toBeFile();
});

test('auth translation file exists for english', function () {
    expect(lang_path('en/auth.php'))->toBeFile();
});

test('auth vietnamese has required translations', function () {
    $translations = include lang_path('vi/auth.php');

    expect($translations)->toHaveKeys([
        'failed',
        'password',
        'throttle',
    ]);
});

test('auth failed translation is correct in vietnamese', function () {
    $translations = include lang_path('vi/auth.php');

    expect($translations['failed'])->toBe('Email hoặc mật khẩu không đúng.');
});

test('auth password translation is correct in vietnamese', function () {
    $translations = include lang_path('vi/auth.php');

    expect($translations['password'])->toBe('Mật khẩu không chính xác.');
});

test('auth throttle translation is correct in vietnamese', function () {
    $translations = include lang_path('vi/auth.php');

    expect($translations['throttle'])->toContain('giây');
});

test('passwords translation file exists for vietnamese', function () {
    expect(lang_path('vi/passwords.php'))->toBeFile();
});

test('passwords vietnamese has required translations', function () {
    $translations = include lang_path('vi/passwords.php');

    expect($translations)->toHaveKeys([
        'reset',
        'sent',
        'throttled',
        'token',
        'user',
    ]);
});

test('passwords reset translation is correct in vietnamese', function () {
    $translations = include lang_path('vi/passwords.php');

    expect($translations['reset'])->toBe('Mật khẩu của bạn đã được đặt lại thành công!');
});

test('passwords sent translation is correct in vietnamese', function () {
    $translations = include lang_path('vi/passwords.php');

    expect($translations['sent'])->toBe('Chúng tôi đã gửi link đặt lại mật khẩu vào email của bạn.');
});

test('passwords user translation is correct in vietnamese', function () {
    $translations = include lang_path('vi/passwords.php');

    expect($translations['user'])->toBe('Không tìm thấy tài khoản với email này.');
});

test('pagination translation file exists for vietnamese', function () {
    expect(lang_path('vi/pagination.php'))->toBeFile();
});

test('pagination vietnamese has required translations', function () {
    $translations = include lang_path('vi/pagination.php');

    expect($translations)->toHaveKeys([
        'previous',
        'next',
    ]);
});

test('pagination translations are correct in vietnamese', function () {
    $translations = include lang_path('vi/pagination.php');

    expect($translations['previous'])->toBe('&laquo; Trước');
    expect($translations['next'])->toBe('Sau &raquo;');
});
