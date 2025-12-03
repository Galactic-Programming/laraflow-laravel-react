<?php

test('projects translations exist in vietnamese', function () {
    $translations = include lang_path('vi/messages.php');

    expect($translations)->toHaveKey('projects');
    expect($translations['projects'])->toBeArray();
    expect($translations['projects'])->toHaveKeys([
        'title',
        'subtitle',
        'search_placeholder',
        'sort_by',
        'filter_by',
        'all_projects',
        'active',
        'archived',
        'completed',
        'all',
        'private',
        'public',
        'create_new',
        'edit_project',
        'delete_project',
        'no_projects',
        'no_projects_desc',
        'no_results',
        'create_title',
        'create_desc',
        'edit_title',
        'edit_desc',
        'project_name',
        'project_name_placeholder',
        'description',
        'description_placeholder',
        'project_color',
        'project_icon',
        'visibility_label',
        'private_label',
        'private_desc',
        'public_label',
        'public_desc',
        'cancel',
        'create_btn',
        'save_btn',
        'delete_title',
        'delete_confirm',
        'delete_warning',
        'delete_btn',
    ]);
});

test('projects translations exist in english', function () {
    $translations = include lang_path('en/messages.php');

    expect($translations)->toHaveKey('projects');
    expect($translations['projects'])->toBeArray();
    expect($translations['projects'])->toHaveKeys([
        'title',
        'subtitle',
        'search_placeholder',
        'sort_by',
        'filter_by',
        'all_projects',
        'active',
        'archived',
        'completed',
        'all',
        'private',
        'public',
        'create_new',
        'edit_project',
        'delete_project',
        'no_projects',
        'no_projects_desc',
        'no_results',
        'create_title',
        'create_desc',
        'edit_title',
        'edit_desc',
        'project_name',
        'project_name_placeholder',
        'description',
        'description_placeholder',
        'project_color',
        'project_icon',
        'visibility_label',
        'private_label',
        'private_desc',
        'public_label',
        'public_desc',
        'cancel',
        'create_btn',
        'save_btn',
        'delete_title',
        'delete_confirm',
        'delete_warning',
        'delete_btn',
    ]);
});

test('projects vietnamese translations are not empty', function () {
    $translations = include lang_path('vi/messages.php');

    foreach ($translations['projects'] as $key => $value) {
        expect($value)
            ->toBeString()
            ->not->toBeEmpty("Translation key 'projects.{$key}' should not be empty");
    }
});

test('projects english translations are not empty', function () {
    $translations = include lang_path('en/messages.php');

    foreach ($translations['projects'] as $key => $value) {
        expect($value)
            ->toBeString()
            ->not->toBeEmpty("Translation key 'projects.{$key}' should not be empty");
    }
});

test('nav has projects key in both languages', function () {
    $enTranslations = include lang_path('en/messages.php');
    $viTranslations = include lang_path('vi/messages.php');

    expect($enTranslations['nav'])->toHaveKey('projects');
    expect($viTranslations['nav'])->toHaveKey('projects');
    expect($enTranslations['nav']['projects'])->toBe('Projects');
    expect($viTranslations['nav']['projects'])->toBe('Dự án');
});

test('projects page title is translated correctly', function () {
    $viTranslations = include lang_path('vi/messages.php');

    expect($viTranslations['projects']['title'])->toBe('Dự án');
    expect($viTranslations['projects']['subtitle'])->toBe('Quản lý và sắp xếp công việc');
});

test('projects status translations are correct in vietnamese', function () {
    $viTranslations = include lang_path('vi/messages.php');

    expect($viTranslations['projects']['active'])->toBe('Đang làm');
    expect($viTranslations['projects']['archived'])->toBe('Đã lưu trữ');
    expect($viTranslations['projects']['completed'])->toBe('Hoàn thành');
});

test('projects visibility translations are correct in vietnamese', function () {
    $viTranslations = include lang_path('vi/messages.php');

    expect($viTranslations['projects']['private_label'])->toBe('Riêng tư');
    expect($viTranslations['projects']['private_desc'])->toBe('Chỉ mình bạn thấy');
    expect($viTranslations['projects']['public_label'])->toBe('Công khai');
    expect($viTranslations['projects']['public_desc'])->toBe('Ai cũng có thể xem');
});
