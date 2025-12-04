import { Check, CircleOff, Sparkles, Waves, Zap } from 'lucide-react';

import { type BackgroundType, useBackground } from '@/contexts/background-context';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';

interface BackgroundOption {
    value: BackgroundType;
    icon: React.ElementType;
    performance: 'none' | 'low' | 'medium' | 'high';
}

const backgroundOptions: BackgroundOption[] = [
    { value: 'none', icon: CircleOff, performance: 'none' },
    { value: 'beams', icon: Sparkles, performance: 'low' },
    { value: 'floating-lines', icon: Waves, performance: 'medium' },
    { value: 'light-pillar', icon: Zap, performance: 'high' },
];

export function BackgroundSelector() {
    const { t } = useTranslations();
    const { background, setBackground } = useBackground();

    const getLabel = (value: BackgroundType) => {
        const labels: Record<BackgroundType, string> = {
            none: t('settings.background_none', 'None'),
            beams: t('settings.background_beams', 'Beams'),
            'floating-lines': t('settings.background_floating_lines', 'Floating Lines'),
            'light-pillar': t('settings.background_light_pillar', 'Light Pillar'),
        };
        return labels[value];
    };

    const getPerformanceLabel = (perf: BackgroundOption['performance']) => {
        const labels: Record<BackgroundOption['performance'], string> = {
            none: '',
            low: t('settings.performance_low', 'Low impact'),
            medium: t('settings.performance_medium', 'Medium impact'),
            high: t('settings.performance_high', 'High impact'),
        };
        return labels[perf];
    };

    const getPerformanceColor = (perf: BackgroundOption['performance']) => {
        const colors: Record<BackgroundOption['performance'], string> = {
            none: '',
            low: 'text-green-600 dark:text-green-400',
            medium: 'text-yellow-600 dark:text-yellow-400',
            high: 'text-orange-600 dark:text-orange-400',
        };
        return colors[perf];
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {backgroundOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = background === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setBackground(option.value)}
                            className={cn(
                                'relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                                'hover:border-primary/50 hover:bg-accent/50',
                                'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                                isSelected ? 'border-primary bg-accent' : 'border-border bg-card',
                            )}
                        >
                            {isSelected && (
                                <div className="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 rounded-full p-0.5">
                                    <Check className="h-3 w-3" />
                                </div>
                            )}
                            <Icon className={cn('h-6 w-6', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                            <span className={cn('text-sm font-medium', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                                {getLabel(option.value)}
                            </span>
                            {option.performance !== 'none' && (
                                <span className={cn('text-xs', getPerformanceColor(option.performance))}>{getPerformanceLabel(option.performance)}</span>
                            )}
                        </button>
                    );
                })}
            </div>
            <p className="text-muted-foreground text-xs">
                {t('settings.background_hint', 'Background effects are applied to dashboard and project pages.')}{' '}
                {t('settings.background_dark_mode_only', 'Effects are only visible in dark mode for best visual experience.')}
            </p>
        </div>
    );
}
