import { CircleAlertIcon, type LucideIcon } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface AlertSoftWarningProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
}

export function AlertSoftWarning({
    title,
    description,
    icon: Icon = CircleAlertIcon,
    className,
}: AlertSoftWarningProps) {
    return (
        <Alert
            className={cn(
                'border-none bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400',
                className
            )}
        >
            <Icon />
            <AlertTitle>{title}</AlertTitle>
            {description && (
                <AlertDescription className="text-amber-600/80 dark:text-amber-400/80">
                    {description}
                </AlertDescription>
            )}
        </Alert>
    );
}
