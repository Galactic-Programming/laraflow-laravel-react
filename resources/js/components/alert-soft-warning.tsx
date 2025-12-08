import { AlertSoft } from '@/components/alert-soft';
import { CircleAlertIcon, type LucideIcon } from 'lucide-react';

interface AlertSoftWarningProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
}

export function AlertSoftWarning({
    title,
    description,
    icon = CircleAlertIcon,
    className,
}: AlertSoftWarningProps) {
    return (
        <AlertSoft
            variant="warning"
            title={title}
            description={description}
            icon={icon}
            className={className}
        />
    );
}
