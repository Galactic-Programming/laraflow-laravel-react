import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark';

export const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    const isDark = appearance === 'dark';

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

// Helper to migrate old 'system' value to actual theme
const migrateAppearance = (saved: string | null): Appearance => {
    if (saved === 'light' || saved === 'dark') {
        return saved;
    }
    // If 'system' or null, use system preference to determine initial theme
    return prefersDark() ? 'dark' : 'light';
};

export function initializeTheme() {
    const savedAppearance = localStorage.getItem('appearance');
    const appearance = migrateAppearance(savedAppearance);

    applyTheme(appearance);

    // Migrate 'system' to actual theme in storage
    if (savedAppearance === 'system' || savedAppearance === null) {
        localStorage.setItem('appearance', appearance);
    }
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('light');

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);

        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', mode);

        // Store in cookie for SSR...
        setCookie('appearance', mode);

        applyTheme(mode);
    }, []);

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance');
        const migrated = migrateAppearance(savedAppearance);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        updateAppearance(migrated);
    }, [updateAppearance]);

    return { appearance, updateAppearance } as const;
}
