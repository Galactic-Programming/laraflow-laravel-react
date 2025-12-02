import { usePage } from '@inertiajs/react';

import { type SharedData, type Translations } from '@/types';

/**
 * Hook to access translations in components.
 *
 * Usage:
 *   const { t, locale, availableLocales } = useTranslations();
 *   const label = t('nav.home', 'Home');
 */
export function useTranslations() {
    const { locale, availableLocales, translations } =
        usePage<SharedData>().props;

    /**
     * Get a translation by dot-notation key.
     *
     * @param key - Dot notation key like 'nav.home' or 'settings.profile_info'
     * @param fallback - Fallback value if translation not found
     */
    const t = (key: string, fallback?: string): string => {
        const keys = key.split('.');
        let value: unknown = translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = (value as Record<string, unknown>)[k];
            } else {
                return fallback ?? key;
            }
        }

        return typeof value === 'string' ? value : (fallback ?? key);
    };

    return {
        t,
        locale,
        availableLocales,
        translations,
    };
}

/**
 * Type-safe translation accessor.
 * Can be used for compile-time checking of translation keys.
 */
export type TranslationKey =
    | `nav.${keyof NonNullable<Translations['nav']>}`
    | `auth.${keyof NonNullable<Translations['auth']>}`
    | `settings.${keyof NonNullable<Translations['settings']>}`
    | `common.${keyof NonNullable<Translations['common']>}`;
