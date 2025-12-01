import { CheckCheckIcon, type LucideIcon } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface AlertSoftSuccessProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
}

export function AlertSoftSuccess({
    title,
    description,
    icon: Icon = CheckCheckIcon,
    className,
}: AlertSoftSuccessProps) {
    return (
        <Alert
            className={cn(
                'border-none bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400',
                className
            )}
        >
            <Icon />
            <AlertTitle>{title}</AlertTitle>
            {description && (
                <AlertDescription className="text-green-600/80 dark:text-green-400/80">
                    {description}
                </AlertDescription>
            )}
        </Alert>
    );
}
