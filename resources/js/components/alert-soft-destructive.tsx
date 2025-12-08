import { AlertSoft } from '@/components/alert-soft';
import { TriangleAlertIcon, type LucideIcon } from 'lucide-react';

interface AlertSoftDestructiveProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
}

export function AlertSoftDestructive({
    title,
    description,
    icon = TriangleAlertIcon,
    className,
}: AlertSoftDestructiveProps) {
    return (
        <AlertSoft
            variant="destructive"
            title={title}
            description={description}
            icon={icon}
            className={className}
        />
    );
}
