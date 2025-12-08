import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

type GradientPreset =
    | 'indigo-pink'
    | 'blue-purple'
    | 'green-teal'
    | 'orange-red'
    | 'custom';

interface BadgeGradientProps {
    children: ReactNode;
    gradient?: GradientPreset;
    fromColor?: string;
    toColor?: string;
    className?: string;
}

const gradientPresets: Record<Exclude<GradientPreset, 'custom'>, string> = {
    'indigo-pink': 'from-indigo-500 to-pink-500',
    'blue-purple': 'from-blue-500 to-purple-500',
    'green-teal': 'from-green-500 to-teal-500',
    'orange-red': 'from-orange-500 to-red-500',
};

export function BadgeGradient({
    children,
    gradient = 'indigo-pink',
    fromColor,
    toColor,
    className,
}: BadgeGradientProps) {
    const gradientClass =
        gradient === 'custom' && fromColor && toColor
            ? `from-${fromColor} to-${toColor}`
            : gradientPresets[gradient as Exclude<GradientPreset, 'custom'>];

    return (
        <Badge
            className={cn(
                'rounded-sm border-transparent bg-gradient-to-r [background-size:105%] bg-center text-white',
                gradientClass,
                className,
            )}
        >
            {children}
        </Badge>
    );
}
