<?php

test('validation translation file exists for vietnamese', function () {
    expect(lang_path('vi/validation.php'))->toBeFile();
});

test('validation translation file exists for english', function () {
    expect(lang_path('en/validation.php'))->toBeFile();
});

test('validation vietnamese has required translations', function () {
    $translations = include lang_path('vi/validation.php');

    expect($translations)->toHaveKeys([
        'required',
        'email',
        'min',
        'max',
        'confirmed',
        'unique',
        'string',
        'numeric',
        'boolean',
        'array',
        'date',
        'accepted',
    ]);
});

test('validation required translation is correct in vietnamese', function () {
    $translations = include lang_path('vi/validation.php');

    expect($translations['required'])->toBe('Vui lòng nhập :attribute.');
});

test('validation email translation is correct in vietnamese', function () {
    $translations = include lang_path('vi/validation.php');

    expect($translations['email'])->toBe('Vui lòng nhập địa chỉ email hợp lệ.');
});

test('validation confirmed translation is correct in vietnamese', function () {
    $translations = include lang_path('vi/validation.php');

    expect($translations['confirmed'])->toBe('Xác nhận :attribute không khớp.');
});

test('validation min translations exist in vietnamese', function () {
    $translations = include lang_path('vi/validation.php');

    expect($translations['min'])->toBeArray();
    expect($translations['min'])->toHaveKeys([
        'numeric',
        'file',
        'string',
        'array',
    ]);
});

test('validation max translations exist in vietnamese', function () {
    $translations = include lang_path('vi/validation.php');

    expect($translations['max'])->toBeArray();
    expect($translations['max'])->toHaveKeys([
        'numeric',
        'file',
        'string',
        'array',
    ]);
});

test('validation attributes exist in vietnamese', function () {
    $translations = include lang_path('vi/validation.php');

    expect($translations)->toHaveKey('attributes');
    expect($translations['attributes'])->toBeArray();
    expect($translations['attributes'])->toHaveKeys([
        'name',
        'email',
        'password',
    ]);
});

test('validation custom attributes are translated correctly', function () {
    $translations = include lang_path('vi/validation.php');

    expect($translations['attributes']['email'])->toBe('email');
    expect($translations['attributes']['password'])->toBe('mật khẩu');
    expect($translations['attributes']['name'])->toBe('họ tên');
});
