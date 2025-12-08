import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';

export type BackgroundType =
    | 'none'
    | 'beams'
    | 'floating-lines'
    | 'light-pillar';

interface BackgroundContextType {
    background: BackgroundType;
    setBackground: (type: BackgroundType) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(
    undefined,
);

const STORAGE_KEY = 'app-background';
const DEFAULT_BACKGROUND: BackgroundType = 'none';

export function BackgroundProvider({ children }: { children: ReactNode }) {
    const [background, setBackgroundState] = useState<BackgroundType>(() => {
        if (typeof window === 'undefined') {
            return DEFAULT_BACKGROUND;
        }
        const stored = localStorage.getItem(STORAGE_KEY);
        if (
            stored &&
            ['none', 'beams', 'floating-lines', 'light-pillar'].includes(stored)
        ) {
            return stored as BackgroundType;
        }
        return DEFAULT_BACKGROUND;
    });

    const setBackground = useCallback((type: BackgroundType) => {
        setBackgroundState(type);
        localStorage.setItem(STORAGE_KEY, type);
    }, []);

    // Sync across tabs
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                setBackgroundState(e.newValue as BackgroundType);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <BackgroundContext.Provider value={{ background, setBackground }}>
            {children}
        </BackgroundContext.Provider>
    );
}

export function useBackground() {
    const context = useContext(BackgroundContext);
    if (context === undefined) {
        throw new Error(
            'useBackground must be used within a BackgroundProvider',
        );
    }
    return context;
}
