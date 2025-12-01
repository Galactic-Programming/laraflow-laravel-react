import { TriangleAlertIcon, type LucideIcon } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface AlertSoftDestructiveProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
}

export function AlertSoftDestructive({
    title,
    description,
    icon: Icon = TriangleAlertIcon,
    className,
}: AlertSoftDestructiveProps) {
    return (
        <Alert
            className={cn(
                'border-none bg-destructive/10 text-destructive',
                className
            )}
        >
            <Icon />
            <AlertTitle>{title}</AlertTitle>
            {description && (
                <AlertDescription className="text-destructive/80">
                    {description}
                </AlertDescription>
            )}
        </Alert>
    );
}
