<?php

test('welcome page translations exist in vietnamese', function () {
    $translations = include lang_path('vi/messages.php');

    expect($translations)->toHaveKey('welcome');
    expect($translations['welcome'])->toBeArray();
    expect($translations['welcome'])->toHaveKeys([
        'get_started',
        'hero_title_1',
        'hero_highlight',
        'hero_desc',
        'features_title',
        'features_desc',
        'pricing_title',
        'faq_title',
    ]);
});

test('welcome page translations exist in english', function () {
    $translations = include lang_path('en/messages.php');

    expect($translations)->toHaveKey('welcome');
    expect($translations['welcome'])->toBeArray();
    expect($translations['welcome'])->toHaveKeys([
        'get_started',
        'hero_title_1',
        'hero_highlight',
        'hero_desc',
        'features_title',
        'features_desc',
        'pricing_title',
        'faq_title',
    ]);
});

test('welcome vietnamese translations are not empty', function () {
    $translations = include lang_path('vi/messages.php');

    foreach ($translations['welcome'] as $key => $value) {
        expect($value)
            ->toBeString()
            ->not->toBeEmpty("Translation key 'welcome.{$key}' should not be empty");
    }
});

test('welcome hero translations are correct in vietnamese', function () {
    $viTranslations = include lang_path('vi/messages.php');

    expect($viTranslations['welcome']['hero_title_1'])->toBe('Quản lý dự án');
    expect($viTranslations['welcome']['hero_highlight'])->toBe('Đơn giản & Hiệu quả');
    expect($viTranslations['welcome']['get_started'])->toBe('Bắt đầu ngay');
});

test('welcome features translations exist', function () {
    $viTranslations = include lang_path('vi/messages.php');

    expect($viTranslations['welcome'])->toHaveKeys([
        'features_title',
        'features_desc',
        'feature_dashboard_title',
        'feature_dashboard_desc',
        'feature_task_title',
        'feature_task_desc',
        'feature_schedule_title',
        'feature_schedule_desc',
        'feature_progress_title',
        'feature_progress_desc',
        'feature_collab_title',
        'feature_collab_desc',
        'feature_notify_title',
        'feature_notify_desc',
    ]);
});

test('welcome pricing translations exist', function () {
    $viTranslations = include lang_path('vi/messages.php');

    expect($viTranslations['welcome'])->toHaveKeys([
        'pricing_title',
        'pricing_desc',
        'pricing_starter',
        'pricing_pro',
        'pricing_monthly',
        'pricing_annually',
        'pricing_per_month',
        'pricing_get_started',
    ]);
});

test('welcome faq translations exist', function () {
    $viTranslations = include lang_path('vi/messages.php');

    expect($viTranslations['welcome'])->toHaveKeys([
        'faq_title',
        'faq_desc',
        'faq_free_title',
        'faq_free_answer',
        'faq_collab_title',
        'faq_collab_answer',
        'faq_schedule_title',
        'faq_schedule_answer',
    ]);
});

test('welcome testimonials translations exist', function () {
    $viTranslations = include lang_path('vi/messages.php');

    expect($viTranslations['welcome'])->toHaveKeys([
        'testimonials_title',
        'testimonials_desc',
        'testimonial_1',
        'testimonial_2',
        'testimonial_3',
        'testimonial_4',
    ]);
});

test('welcome footer translations exist', function () {
    $viTranslations = include lang_path('vi/messages.php');

    expect($viTranslations['welcome'])->toHaveKeys([
        'footer_features',
        'footer_pricing',
        'footer_faq',
        'footer_contact',
        'footer_copyright',
    ]);
});
