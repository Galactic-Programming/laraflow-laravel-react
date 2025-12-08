import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

export type AlertSoftVariant = 'info' | 'success' | 'warning' | 'destructive';

interface AlertSoftProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
    variant?: AlertSoftVariant;
}

const variantStyles: Record<
    AlertSoftVariant,
    { alert: string; description: string }
> = {
    info: {
        alert: 'border-none bg-sky-600/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400',
        description: 'text-sky-600/80 dark:text-sky-400/80',
    },
    success: {
        alert: 'border-none bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400',
        description: 'text-green-600/80 dark:text-green-400/80',
    },
    warning: {
        alert: 'border-none bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400',
        description: 'text-amber-600/80 dark:text-amber-400/80',
    },
    destructive: {
        alert: 'border-none bg-destructive/10 text-destructive',
        description: 'text-destructive/80',
    },
};

export function AlertSoft({
    title,
    description,
    icon: Icon,
    className,
    variant = 'info',
}: AlertSoftProps) {
    const styles = variantStyles[variant];

    return (
        <Alert className={cn(styles.alert, className)}>
            {Icon && <Icon />}
            <AlertTitle>{title}</AlertTitle>
            {description && (
                <AlertDescription className={styles.description}>
                    {description}
                </AlertDescription>
            )}
        </Alert>
    );
}
