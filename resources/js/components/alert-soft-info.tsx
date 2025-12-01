import { InfoIcon, type LucideIcon } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface AlertSoftInfoProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
}

export function AlertSoftInfo({
    title,
    description,
    icon: Icon = InfoIcon,
    className,
}: AlertSoftInfoProps) {
    return (
        <Alert
            className={cn(
                'border-none bg-sky-600/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400',
                className
            )}
        >
            <Icon />
            <AlertTitle>{title}</AlertTitle>
            {description && (
                <AlertDescription className="text-sky-600/80 dark:text-sky-400/80">
                    {description}
                </AlertDescription>
            )}
        </Alert>
    );
}
