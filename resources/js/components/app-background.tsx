import { lazy, memo, Suspense, useEffect, useState } from 'react';

import { type BackgroundType, useBackground } from '@/contexts/background-context';

// Lazy load heavy components to optimize performance
const BackgroundBeams = lazy(() => import('@/components/ui/background-beams').then((m) => ({ default: m.BackgroundBeams })));
const FloatingLines = lazy(() => import('@/components/floating-lines'));
const LightPillar = lazy(() => import('@/components/light-pillar'));

// Dark mode color configurations (background effects only show in dark mode)
const darkModeColors = {
    floatingLines: ['#38bdf8', '#818cf8', '#c084fc', '#f472b6'], // Cyan to pink - glowing on dark bg
    lightPillar: { top: '#5227FF', bottom: '#FF9FFC' }, // Purple to magenta
};

// Hook to detect if dark mode is active
function useIsDarkMode() {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window === 'undefined') return false;
        return document.documentElement.classList.contains('dark');
    });

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDark(document.documentElement.classList.contains('dark'));
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    return isDark;
}

const BackgroundRenderer = memo(function BackgroundRenderer({ type }: { type: BackgroundType }) {
    const baseClass = 'pointer-events-none absolute inset-0 z-0 overflow-hidden';

    switch (type) {
        case 'beams':
            return (
                <Suspense fallback={null}>
                    <div className={`${baseClass} opacity-50`}>
                        <BackgroundBeams className="h-full w-full" />
                    </div>
                </Suspense>
            );
        case 'floating-lines':
            return (
                <Suspense fallback={null}>
                    <div className={`${baseClass} opacity-80`}>
                        <FloatingLines
                            linesGradient={darkModeColors.floatingLines}
                            animationSpeed={0.8}
                            interactive={false}
                            parallax={false}
                        />
                    </div>
                </Suspense>
            );
        case 'light-pillar':
            return (
                <Suspense fallback={null}>
                    <div className={`${baseClass} opacity-60`}>
                        <LightPillar
                            topColor={darkModeColors.lightPillar.top}
                            bottomColor={darkModeColors.lightPillar.bottom}
                            interactive={false}
                            rotationSpeed={0.2}
                        />
                    </div>
                </Suspense>
            );
        default:
            return null;
    }
});

export function AppBackground() {
    const { background } = useBackground();
    const isDarkMode = useIsDarkMode();

    // Only show background effects in dark mode for best visual experience
    if (background === 'none' || !isDarkMode) {
        return null;
    }

    return <BackgroundRenderer type={background} />;
}
