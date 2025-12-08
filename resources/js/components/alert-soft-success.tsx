import { AlertSoft } from '@/components/alert-soft';
import { CheckCheckIcon, type LucideIcon } from 'lucide-react';

interface AlertSoftSuccessProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
}

export function AlertSoftSuccess({
    title,
    description,
    icon = CheckCheckIcon,
    className,
}: AlertSoftSuccessProps) {
    return (
        <AlertSoft
            variant="success"
            title={title}
            description={description}
            icon={icon}
            className={className}
        />
    );
}
