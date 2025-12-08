import { AlertSoft } from '@/components/alert-soft';
import { InfoIcon, type LucideIcon } from 'lucide-react';

interface AlertSoftInfoProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
}

export function AlertSoftInfo({
    title,
    description,
    icon = InfoIcon,
    className,
}: AlertSoftInfoProps) {
    return (
        <AlertSoft
            variant="info"
            title={title}
            description={description}
            icon={icon}
            className={className}
        />
    );
}
